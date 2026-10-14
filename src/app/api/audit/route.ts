import { waitUntil } from '@vercel/functions';
import { subscribe } from '@/lib/mailerlite';
import { checkOrigin, checkShape, scoreContent } from '@/lib/spam';
import { clientKey, rateLimit } from '@/lib/ratelimit';
import { verifyTurnstile } from '@/lib/turnstile';
import { runAudit, AuditInputError } from '@/lib/audit/run';
import { sendReportEmails } from '@/lib/audit/email';
import type { AuditEvent, AuditReport } from '@/lib/audit/types';

// The instant audit. Same front door as /api/subscribe (honeypot, origin, rate
// limit, shape, content score, Turnstile), then the audit agent runs and streams
// its progress back as newline-delimited JSON, one AuditEvent per line.
//
// The run itself is handed to waitUntil, so if the visitor closes the tab the audit
// still finishes and the report still reaches their inbox.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// PageSpeed alone can take a minute. Needs Fluid compute (on by default) or Pro.
export const maxDuration = 120;

const FALLBACK =
  'Sorry, the audit could not start just now. Please email hello@ilovedigital.com.au or call 1300 944 890 and we will run it for you.';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (typeof parsed !== 'object' || parsed === null) return json({ ok: true });
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: true });
  }

  // Silent drops, as in /api/subscribe: these payloads cannot have come from our form.
  if (typeof body.hp === 'string' && body.hp.trim() !== '') return json({ ok: true });
  if (body.type !== 'audit') return json({ ok: true });
  const origin = checkOrigin(req);
  if (!origin.ok) {
    console.warn('[audit] dropped:', origin.reason);
    return json({ ok: true });
  }

  const ip = clientKey(req);
  if (!rateLimit(`audit:${ip}`).ok) {
    return json({ error: 'You have run a few audits in a short time. Please wait ten minutes and try again.' }, 429);
  }

  const shape = checkShape('audit', body);
  if (!shape.ok) {
    console.warn('[audit] dropped:', shape.reason);
    return json({ ok: true });
  }

  const { email, website, name, business, message, token } = body as Record<string, string | undefined>;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'A valid email is required.' }, 400);
  }
  if (!website) return json({ error: 'Please enter your website address.' }, 400);

  const content = scoreContent({ email, name, business, website, message, type: 'audit' });
  if (!content.ok) {
    console.warn('[audit] refused:', content.reason);
    return json({ error: FALLBACK }, 400);
  }
  const turnstile = await verifyTurnstile(token, ip);
  if (!turnstile.ok) {
    console.warn('[audit] refused:', turnstile.reason);
    return json({ error: FALLBACK }, 400);
  }

  const lead = { email, name: name?.trim() || null, business: business?.trim() || null, concern: message?.trim() || null };
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  let open = true;

  const send = (e: AuditEvent) => {
    if (!open || !controller) return;
    try {
      controller.enqueue(encoder.encode(JSON.stringify(e) + '\n'));
    } catch {
      open = false;
    }
  };
  const close = () => {
    if (!open || !controller) return;
    open = false;
    try {
      controller.close();
    } catch {
      // already closed by the client going away
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
    cancel() {
      // The visitor left. The audit keeps running under waitUntil and emails them.
      open = false;
    },
  });

  const job = (async () => {
    let report: AuditReport | null = null;
    try {
      report = await runAudit({ url: website, business: lead.business, concern: lead.concern, onEvent: send });
      send({ type: 'report', report });
    } catch (e) {
      if (e instanceof AuditInputError) {
        send({ type: 'error', message: e.message });
      } else {
        console.error('[audit] run failed:', e);
        send({ type: 'error', message: FALLBACK });
      }
    } finally {
      close();
    }

    // List building. A separate group (ML_GROUP_INSTANT_AUDIT) keeps these leads
    // out of the old manual-audit automation, whose auto-reply promises a Loom in
    // three business days. Unset means added to MailerLite with no group.
    if (process.env.MAILERLITE_API_KEY) {
      const fields: Record<string, string> = { website };
      if (lead.name) fields.name = lead.name;
      if (lead.business) fields.company = lead.business;
      if (lead.concern) fields.message = lead.concern;
      const group = process.env.ML_GROUP_INSTANT_AUDIT;
      await subscribe({ email, fields, groups: group ? [group] : undefined }).catch((err) =>
        console.error('[audit] MailerLite subscribe failed:', err),
      );
    }

    if (report) {
      const sent = await sendReportEmails(report, lead);
      console.log('[audit] complete', { host: report.host, overall: report.overall, plan: report.interpretation.source, ...sent });
    }
  })();

  waitUntil(job);

  return new Response(stream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-store',
      'x-accel-buffering': 'no',
    },
  });
}
