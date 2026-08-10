import { NextResponse } from 'next/server';
import { subscribe } from '@/lib/mailerlite';
import { notify } from '@/lib/notify';

// Maps a form "type" to a MailerLite group. The group is what triggers the
// subscriber-facing auto-reply automation in MailerLite. MailerLite cannot email
// anyone but the subscriber, so the internal notification is sent from here.
const GROUPS: Record<string, string | undefined> = {
  newsletter: process.env.ML_GROUP_NEWSLETTER,
  audit: process.env.ML_GROUP_AUDIT,
  contact: process.env.ML_GROUP_CONTACT,
};

// Whatever comes back from here is read by a real visitor: the form renders the
// error text verbatim. Never return a configuration detail or an upstream error
// message — give the person a way to reach us instead, so an enquiry is redirected
// rather than lost.
const FALLBACK =
  'Sorry, the form could not be sent just now. Please email hello@ilovedigital.com.au or call 1300 944 890 and we will come straight back to you.';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, type = 'newsletter', name, business, website, message } = body ?? {};

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!process.env.MAILERLITE_API_KEY) {
      console.error('[subscribe] MAILERLITE_API_KEY is not set — submission not delivered:', {
        type,
        email,
      });
      return NextResponse.json({ error: FALLBACK }, { status: 503 });
    }

    const fields: Record<string, string> = {};
    if (name) fields.name = name;
    if (business) fields.company = business;
    if (website) fields.website = website;
    if (message) fields.message = message;

    const groupId = GROUPS[type];
    await subscribe({ email, fields, groups: groupId ? [groupId] : undefined });

    // Awaited deliberately. Serverless functions can be frozen the moment the
    // response is returned, so a floating promise here would be killed before
    // the request reaches Resend. notify() never throws, so a notification
    // failure cannot turn a captured lead into an error for the visitor.
    await notify({ type, email, fields });

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Log the real reason for us; show the visitor something they can act on.
    console.error('[subscribe] submission failed:', e);
    return NextResponse.json({ error: FALLBACK }, { status: 500 });
  }
}
