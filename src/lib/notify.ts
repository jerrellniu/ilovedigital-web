// Server-only internal notification. Sends a plain-text email to the studio
// whenever a form is submitted, over Google Workspace SMTP.
//
// This exists because MailerLite automations can only email the subscriber —
// there is no internal notification step. Without this, a form submission is
// captured but nobody is told about it until someone opens MailerLite.
//
// Workspace rather than a transactional provider: this is a handful of plain
// emails a month to our own inbox. Workspace is already paid for, needs no
// sending domain, and adds no second reputation to manage.
//
// Requires SMTP_USER and SMTP_PASSWORD. SMTP_PASSWORD must be a Google app
// password, not the account password — that requires 2-Step Verification on
// the account. NOTIFY_TO defaults to the same mailbox we send from.

import nodemailer from 'nodemailer';

const HOST = 'smtp.gmail.com';
const PORT = 465; // implicit TLS

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
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    console.error('[notify] SMTP_USER or SMTP_PASSWORD is not set — no internal notification sent:', {
      type,
      email,
    });
    return;
  }

  const to = process.env.NOTIFY_TO || user;
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
    // Gmail requires the envelope sender to be the authenticated mailbox (or a
    // verified "Send mail as" alias), so `from` is derived from SMTP_USER rather
    // than configured separately. Reply-to is the enquirer, so replying to the
    // notification goes straight back to them.
    const transport = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: true,
      auth: { user, pass },
    });

    await transport.sendMail({
      from: `"I Love Digital website" <${user}>`,
      to,
      replyTo: email,
      subject: `${label} — ${email}`,
      text: lines.join('\n'),
    });
  } catch (e) {
    console.error('[notify] internal notification failed:', e);
  }
}
