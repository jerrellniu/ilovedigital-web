import { NextResponse } from 'next/server';
import { subscribe } from '@/lib/mailerlite';

// Maps a form "type" to a MailerLite group. The group is what triggers the
// automation in MailerLite (internal notification + auto-reply), per the workflow.
const GROUPS: Record<string, string | undefined> = {
  newsletter: process.env.ML_GROUP_NEWSLETTER,
  audit: process.env.ML_GROUP_AUDIT,
  contact: process.env.ML_GROUP_CONTACT,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, type = 'newsletter', name, business, website, message } = body ?? {};

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!process.env.MAILERLITE_API_KEY) {
      return NextResponse.json(
        { error: 'MailerLite is not configured yet. Set MAILERLITE_API_KEY.' },
        { status: 501 }
      );
    }

    const fields: Record<string, string> = {};
    if (name) fields.name = name;
    if (business) fields.company = business;
    if (website) fields.website = website;
    if (message) fields.message = message;

    const groupId = GROUPS[type];
    await subscribe({ email, fields, groups: groupId ? [groupId] : undefined });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
