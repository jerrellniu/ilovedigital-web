// Server-only internal notification. Sends a plain-text email to the studio
// whenever a form is submitted, via the Resend API.
//
// This exists because MailerLite automations can only email the subscriber —
// there is no internal notification step. Without this, a form submission is
// captured but nobody is told about it until someone opens MailerLite.
//
// Requires RESEND_API_KEY. NOTIFY_TO and NOTIFY_FROM have sensible defaults so
// a missing value degrades to the right address rather than throwing.

const API = 'https://api.resend.com/emails';

const TO = process.env.NOTIFY_TO || 'hello@ilovedigital.com.au';
const FROM = process.env.NOTIFY_FROM || 'website@ilovedigital.com.au';

const LABELS: Record<string, string> = {
  newsletter: 'Newsletter signup',
  audit: 'Free website audit request',
  contact: 'Contact enquiry',
};

export interface NotifyParams {
  type: string;
  email: string;
  fields: Record<string, string>;
}

/**
 * Fire an internal notification. Never throws — a notification failure must not
 * turn a captured lead into an error for the visitor. Failures are logged so
 * they show up in the Vercel runtime logs.
 */
export async function notify({ type, email, fields }: NotifyParams): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('[notify] RESEND_API_KEY is not set — no internal notification sent:', {
      type,
      email,
    });
    return;
  }

  const label = LABELS[type] ?? type;
  const lines = [
    `${label} from ilovedigital.com.au`,
    '',
    `Email: ${email}`,
    ...Object.entries(fields).map(([k, v]) => `${k[0].toUpperCase()}${k.slice(1)}: ${v}`),
    '',
    'The subscriber is in MailerLite and the auto-reply has been sent.',
  ];

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from: `I Love Digital website <${FROM}>`,
        to: [TO],
        reply_to: email,
        subject: `${label} — ${email}`,
        text: lines.join('\n'),
      }),
    });

    if (!res.ok) {
      console.error(`[notify] Resend ${res.status}:`, await res.text());
    }
  } catch (e) {
    console.error('[notify] internal notification failed:', e);
  }
}
