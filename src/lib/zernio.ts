// Zernio webhooks: signature check and the lead.received payload.
//
// Zernio's contract (docs.zernio.com/webhooks, checked 22 October 2026):
//   - X-Zernio-Signature is the lowercase hex HMAC-SHA256 of the RAW request body,
//     keyed by the secret set when the endpoint was registered. No prefix.
//   - X-Zernio-Event-Id equals the body's `id`; it is the deduplication key.
//   - Delivery is at least once. A 2xx within 5 seconds is success; anything else
//     is retried up to 7 times over about two days.
//   - lead.received carries `lead.formId`, `lead.leadgenId`, `lead.adId` (null for
//     test leads), `lead.campaignId` and `lead.fields`, a flat map of question key
//     to answer. Multiple-choice answers arrive as option keys, not labels.

import { createHmac, timingSafeEqual } from 'node:crypto';

/** True when `signature` is the HMAC-SHA256 of `raw` under `secret`. Constant time. */
export function verifySignature(raw: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const given = signature.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(given)) return false;
  const expected = createHmac('sha256', secret).update(raw, 'utf8').digest('hex');
  return timingSafeEqual(Buffer.from(given, 'hex'), Buffer.from(expected, 'hex'));
}

export interface LeadEvent {
  eventId: string;
  formId: string;
  leadgenId: string;
  adId: string | null;
  campaignId: string | null;
  /** Question key to answer. Array answers are joined with ", ". */
  fields: Record<string, string>;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');

/**
 * The lead out of a lead.received body, or null when the body is not one.
 * Defensive about shape: anything unexpected becomes an empty string rather than
 * a throw, so a lead is never lost to a parser error.
 */
export function parseLeadEvent(body: unknown, headerEventId: string | null): LeadEvent | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  if (b.event !== 'lead.received') return null;
  const lead = (typeof b.lead === 'object' && b.lead !== null ? b.lead : {}) as Record<string, unknown>;

  const fields: Record<string, string> = {};
  const raw = typeof lead.fields === 'object' && lead.fields !== null ? (lead.fields as Record<string, unknown>) : {};
  for (const [k, v] of Object.entries(raw)) {
    const value = Array.isArray(v) ? v.map(str).filter(Boolean).join(', ') : str(v);
    if (value) fields[k] = value.slice(0, 2000);
  }

  return {
    eventId: str(headerEventId) || str(b.id),
    formId: str(lead.formId),
    leadgenId: str(lead.leadgenId),
    adId: str(lead.adId) || null,
    campaignId: str(lead.campaignId) || null,
    fields,
  };
}
