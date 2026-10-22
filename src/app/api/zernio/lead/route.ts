import { waitUntil } from '@vercel/functions';
import { getSubscriber, subscribe } from '@/lib/mailerlite';
import { notify } from '@/lib/notify';
import { parseLeadEvent, verifySignature } from '@/lib/zernio';
import { normaliseLead } from '@/lib/lead-forms';
import { runAudit } from '@/lib/audit/run';
import { sendReportEmails } from '@/lib/audit/email';

// Meta Instant Form leads, delivered by Zernio's lead.received webhook.
// Spec: "Build Brief — Lead Source, Article Audit CTA and Meta Form Leads
// (October 2026)" in Notion, Part C.
//
// There is no native Meta to MailerLite connection, and every connector is a paid
// third party. We already pay for Zernio, which signs and retries this webhook.
//
// Inside Zernio's 5-second window, in this order:
//   1. Duplicate check: if the subscriber already carries this leadgen_id, stop.
//   2. Internal notification ("Facebook lead form"), reply-to the lead.
//   3. MailerLite: the Facebook leads group, with source = Facebook and leadgen_id.
//   4. 200. If step 2 or 3 fails, 500, so Zernio retries.
//
// The notification goes before MailerLite on purpose (the brief listed MailerLite
// first). leadgen_id is only written in step 3, so a MailerLite failure retries
// both steps and at worst sends a second notification. The other order would let a
// failed notification be skipped on the retry, because the duplicate check would
// already see the leadgen_id, and the lead would arrive with nobody told.
//
// After the response, the instant audit runs on the lead's website and the report
// is emailed, exactly as /api/audit does. FB_LEAD_AUTO_AUDIT=off turns that off
// without a deploy.
//
// No Meta Conversions API event is sent: Meta already counts its own form leads.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// The audit runs under waitUntil after the response and can take a minute.
export const maxDuration = 120;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// Best-effort replay guard for one warm instance. The leadgen_id check in
// MailerLite is the real deduplication; this only saves the lookups when Zernio
// redelivers to the same instance.
const seen = new Set<string>();
const remember = (id: string) => {
  if (!id) return;
  seen.add(id);
  if (seen.size > 500) seen.delete(seen.values().next().value as string);
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const secret = process.env.ZERNIO_WEBHOOK_SECRET;
  if (!secret) {
    // 503 rather than 200: Zernio keeps retrying for about two days, so leads sent
    // before the secret is set still arrive once it is.
    console.error('[zernio] ZERNIO_WEBHOOK_SECRET is not set — lead not processed');
    return json({ error: 'not configured' }, 503);
  }

  // Verify the raw bytes before parsing anything.
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get('x-zernio-signature'), secret)) {
    console.warn('[zernio] bad signature');
    return json({ error: 'bad signature' }, 401);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    console.warn('[zernio] body is not JSON');
    return json({ ok: true });
  }

  // webhook.test and every other event: acknowledge and do nothing.
  const event = parseLeadEvent(body, req.headers.get('x-zernio-event-id'));
  if (!event) return json({ ok: true });
  if (event.eventId && seen.has(event.eventId)) return json({ ok: true, duplicate: true });

  const lead = normaliseLead(event.formId, event.fields);
  if (!lead.known) console.warn('[zernio] lead from an unmapped form', { formId: event.formId });
  const hasEmail = EMAIL.test(lead.email);

  // 1. Duplicate check. A failed lookup does not block: a duplicate is better than a loss.
  if (hasEmail && event.leadgenId && process.env.MAILERLITE_API_KEY) {
    try {
      const existing = await getSubscriber(lead.email, 1500);
      if (existing && String(existing.fields?.leadgen_id ?? '') === event.leadgenId) {
        remember(event.eventId);
        return json({ ok: true, duplicate: true });
      }
    } catch (e) {
      console.warn('[zernio] duplicate check failed, carrying on:', e);
    }
  }

  const sourceDetail = [event.campaignId && `campaign ${event.campaignId}`, event.adId ? `ad ${event.adId}` : 'test lead (no ad)']
    .filter(Boolean)
    .join(', ');

  // 2. Notification. An unmapped form also lists every raw answer.
  const lines: Record<string, string> = {};
  if (lead.name) lines.name = lead.name;
  if (lead.phone) lines.phone = lead.phone;
  if (lead.business) lines.business = lead.business;
  if (lead.website) lines.website = lead.website;
  if (lead.interest) lines.interest = lead.interest;
  if (lead.service) lines['service interest'] = lead.service;
  lines.source = 'Facebook';
  lines['source detail'] = sourceDetail;
  lines.form = lead.formName;
  if (event.leadgenId) lines['leadgen ID'] = event.leadgenId;
  if (!lead.known) {
    for (const [k, v] of Object.entries(event.fields)) lines[`answer ${k}`] = v;
  }
  if (!hasEmail) lines['warning'] = 'No valid email in the lead. It is not in MailerLite; follow up from Leads Centre.';

  const notified = await notify({
    type: 'facebook_lead',
    email: hasEmail ? lead.email : 'no email given',
    fields: lines,
    footer: hasEmail
      ? 'The lead is being added to MailerLite (Facebook leads group).'
      : 'This lead could not be added to MailerLite.',
  });
  if (!notified) {
    console.error('[zernio] notification failed — asking Zernio to retry', { leadgenId: event.leadgenId });
    return json({ error: 'notification failed' }, 500);
  }

  // 3. MailerLite.
  if (hasEmail && process.env.MAILERLITE_API_KEY) {
    const fields: Record<string, string> = { source: 'Facebook', source_detail: sourceDetail.slice(0, 100) };
    if (lead.name) fields.name = lead.name;
    if (lead.phone) fields.phone = lead.phone;
    if (lead.business) fields.company = lead.business;
    if (lead.website) fields.website = lead.website;
    if (lead.interest) fields.interest = lead.interest;
    if (event.leadgenId) fields.leadgen_id = event.leadgenId;
    const group = process.env.ML_GROUP_FACEBOOK_LEADS;
    try {
      await subscribe({ email: lead.email, fields, groups: group ? [group] : undefined });
    } catch (e) {
      console.error('[zernio] MailerLite subscribe failed — asking Zernio to retry:', e);
      return json({ error: 'mailerlite failed' }, 500);
    }
  } else if (hasEmail) {
    console.error('[zernio] MAILERLITE_API_KEY is not set — lead notified but not in MailerLite', { leadgenId: event.leadgenId });
  }

  remember(event.eventId);

  // After the response: the instant audit, which keeps the form's "within one
  // business day" promise in about a minute. A bad URL ends quietly with a log line.
  if (hasEmail && lead.website && process.env.FB_LEAD_AUTO_AUDIT !== 'off') {
    waitUntil(
      (async () => {
        try {
          const report = await runAudit({ url: lead.website, business: lead.business || null });
          const sent = await sendReportEmails(report, {
            email: lead.email,
            name: lead.name || null,
            business: lead.business || null,
            concern: null,
            label: 'New Facebook lead form audit',
            extra: { source: 'Facebook', 'source detail': sourceDetail, ...(lead.phone ? { phone: lead.phone } : {}), ...(lead.interest ? { interest: lead.interest } : {}) },
          });
          console.log('[zernio] audit complete', { host: report.host, overall: report.overall, ...sent });
        } catch (e) {
          console.log('[zernio] audit not run:', (e as Error).message);
        }
      })(),
    );
  }

  return json({ ok: true });
}
