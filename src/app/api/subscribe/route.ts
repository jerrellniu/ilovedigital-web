import { NextResponse } from 'next/server';
import { subscribe } from '@/lib/mailerlite';
import { notify } from '@/lib/notify';
import { checkOrigin, checkShape, isFormType, scoreContent } from '@/lib/spam';
import { clientKey, rateLimit } from '@/lib/ratelimit';
import { verifyTurnstile } from '@/lib/turnstile';

// nodemailer needs Node built-ins, so this route must not be pushed to Edge.
export const runtime = 'nodejs';

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

// Two ways to turn a submission away, and the difference matters.
//
// `drop` answers 200 and does nothing. The caller believes it succeeded, so it has
// no signal to tune against and no reason to retry with the offending field removed.
// Reserved for cases where the payload cannot have come from our form at all.
//
// `refuse` returns the fallback text. Used where the judgement is a heuristic and a
// real person could conceivably be on the other end — they get a phone number and an
// address instead of silence. Never let a false positive swallow an enquiry.
function drop(reason: string, context: Record<string, unknown>) {
  console.warn('[subscribe] dropped:', reason, context);
  return NextResponse.json({ ok: true });
}

function refuse(reason: string, context: Record<string, unknown>, status = 400) {
  console.warn('[subscribe] refused:', reason, context);
  return NextResponse.json({ error: FALLBACK }, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (typeof body !== 'object' || body === null) {
      return drop('body is not an object', {});
    }

    const { email, type = 'newsletter', hp, token } = body as Record<string, unknown>;

    // Honeypot. Only a bot fills this — the field is off-screen and untabbable.
    // Still worth keeping: it costs nothing and catches the bots that do drive the
    // rendered form. It cannot catch a bot posting JSON at this route directly,
    // which is what everything below is for.
    if (typeof hp === 'string' && hp.trim() !== '') {
      return drop('honeypot filled', { type });
    }

    if (!isFormType(type)) {
      return drop('unknown form type', { type });
    }

    // Cheapest first. A browser submitting our own form always identifies itself.
    const origin = checkOrigin(req);
    if (!origin.ok) {
      return drop(origin.reason!, { type });
    }

    const ip = clientKey(req);
    const limit = rateLimit(ip);
    if (!limit.ok) {
      return refuse('rate limit exceeded', { type, ip }, 429);
    }

    // Shape before content: an unexpected field proves the payload was hand-built,
    // which is a stronger signal than anything the values can tell us.
    const shape = checkShape(type, body as Record<string, unknown>);
    if (!shape.ok) {
      return drop(shape.reason!, { type });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const { name, business, website, message } = body as Record<string, string | undefined>;

    const content = scoreContent({ email, name, business, website, message, type });
    if (!content.ok) {
      return refuse(content.reason!, { type, email });
    }

    // Last and strongest. Skipped entirely until TURNSTILE_SECRET_KEY is set.
    const turnstile = await verifyTurnstile(token, ip);
    if (!turnstile.ok) {
      return refuse(turnstile.reason!, { type, email });
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
    // the mail is handed off. notify() never throws, so a notification failure
    // cannot turn a captured lead into an error for the visitor.
    await notify({ type, email, fields });

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Log the real reason for us; show the visitor something they can act on.
    console.error('[subscribe] submission failed:', e);
    return NextResponse.json({ error: FALLBACK }, { status: 500 });
  }
}
