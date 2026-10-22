// Server side of the first-touch lead source (src/lib/attribution.ts).
//
// Turns the attribution fields a form sends into two things:
//   - lines on the internal notification email, which the nightly email sweep
//     reads to fill Lead Source, Referral Source and Notes in the Leads database;
//   - MailerLite fields `source`, `source_detail` and `heard_about` (text fields,
//     created in MailerLite before this shipped).
//
// Values were length-capped by checkShape() before they reach here.

export interface LeadSourceFields {
  /** Notification lines, keyed as they should read ("Source detail: ..."). */
  notify: Record<string, string>;
  /** MailerLite subscriber fields. */
  mailerlite: Record<string, string>;
}

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export function leadSourceFields(body: Record<string, unknown>): LeadSourceFields {
  const source = clean(body.source);
  const detail = clean(body.sourceDetail);
  const landing = clean(body.landingPage);
  const heard = clean(body.heardAbout);

  const notify: Record<string, string> = {};
  const mailerlite: Record<string, string> = {};

  // Always present, so the sweep can tell "no record" (storage blocked, or the
  // visitor arrived before this shipped) from a missing line.
  notify['source'] = source || 'Unknown';
  if (detail) notify['source detail'] = detail;
  if (landing) notify['landing page'] = landing;
  if (heard) notify['heard about us'] = heard;

  if (source) mailerlite.source = source;
  if (detail) mailerlite.source_detail = detail;
  if (heard) mailerlite.heard_about = heard;

  return { notify, mailerlite };
}
