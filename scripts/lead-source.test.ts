// Tests for the Lead Source, article audit card and Zernio form-lead build.
//   npx tsx --test scripts/lead-source.test.ts
//
// Spec: "Build Brief — Lead Source, Article Audit CTA and Meta Form Leads (October
// 2026)" in Notion.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHmac } from 'node:crypto';
import { createRequire } from 'node:module';
import { detectSource } from '../src/lib/attribution';
import { leadSourceFields } from '../src/lib/lead-fields';
import { checkShape } from '../src/lib/spam';
import { splitForAuditCard } from '../src/lib/article-split';
import { extractFaqs } from '../src/lib/faq';
import { parseLeadEvent, verifySignature } from '../src/lib/zernio';
import { INTEREST_TO_SERVICE, LEAD_FORMS, normaliseLead } from '../src/lib/lead-forms';

const SELF = 'ilovedigital.com.au';
const src = (search: string, referrer = '') => detectSource({ search, referrer, selfHost: SELF });

// ---------- Part A: source mapping ----------

test('utm_source wins, mapped to a channel, with the campaign as detail', () => {
  assert.deepEqual(src('?utm_source=facebook&utm_campaign=test'), { source: 'Facebook', detail: 'test' });
  assert.deepEqual(src('?utm_source=FB'), { source: 'Facebook', detail: '' });
  assert.equal(src('?utm_source=meta').source, 'Facebook');
  assert.equal(src('?utm_source=ig').source, 'Instagram');
  assert.equal(src('?utm_source=instagram').source, 'Instagram');
  assert.equal(src('?utm_source=tiktok').source, 'TikTok');
  assert.equal(src('?utm_source=linkedin').source, 'LinkedIn');
  assert.equal(src('?utm_source=google').source, 'Google');
  assert.equal(src('?utm_source=newsletter').source, 'Other');
  // utm beats a referrer that says otherwise
  assert.equal(src('?utm_source=facebook', 'https://www.google.com/').source, 'Facebook');
});

test('click IDs come next', () => {
  assert.equal(src('?fbclid=abc').source, 'Facebook');
  assert.equal(src('?gclid=abc').source, 'Google');
  assert.equal(src('?ttclid=abc').source, 'TikTok');
  assert.equal(src('?li_fat_id=abc').source, 'LinkedIn');
  assert.equal(src('?fbclid=abc', 'https://www.google.com/').source, 'Facebook');
});

test('referrer hosts map to channels; AI search is checked before Google', () => {
  assert.equal(src('', 'https://www.google.com.au/').source, 'Google');
  assert.equal(src('', 'https://www.bing.com/search?q=x').source, 'Google');
  assert.equal(src('', 'https://l.facebook.com/l.php?u=x').source, 'Facebook');
  assert.equal(src('', 'https://m.facebook.com/').source, 'Facebook');
  assert.equal(src('', 'https://l.instagram.com/').source, 'Instagram');
  assert.equal(src('', 'https://www.tiktok.com/').source, 'TikTok');
  assert.equal(src('', 'https://lnkd.in/abc').source, 'LinkedIn');
  for (const host of ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai']) {
    assert.equal(src('', `https://${host}/`).source, 'AI search', host);
  }
});

test('any other referrer is Referral, with the host as detail', () => {
  assert.deepEqual(src('', 'https://www.solarset.com.au/partners'), { source: 'Referral', detail: 'www.solarset.com.au' });
});

test('no referrer and no parameters is Direct; our own site as referrer is Direct', () => {
  assert.equal(src('').source, 'Direct');
  assert.equal(src('', 'https://www.ilovedigital.com.au/insights').source, 'Direct');
  assert.equal(src('', 'not a url').source, 'Direct');
});

test('detail is capped at 100 characters', () => {
  assert.equal(src(`?utm_source=facebook&utm_campaign=${'x'.repeat(300)}`).detail.length, 100);
});

test('leadSourceFields builds notification lines and MailerLite fields', () => {
  const f = leadSourceFields({ source: 'Facebook', sourceDetail: 'oct-audit', landingPage: '/audit', heardAbout: 'A friend or referral' });
  assert.deepEqual(f.notify, { source: 'Facebook', 'source detail': 'oct-audit', 'landing page': '/audit', 'heard about us': 'A friend or referral' });
  assert.deepEqual(f.mailerlite, { lead_source: 'Facebook', source_detail: 'oct-audit', heard_about: 'A friend or referral' });
  // No record at all: the line still says so, MailerLite gets nothing.
  const none = leadSourceFields({});
  assert.deepEqual(none.notify, { source: 'Unknown' });
  assert.deepEqual(none.mailerlite, {});
});

test('a real payload carrying the source fields passes the shape check', () => {
  const base = { eventId: 'e1', fbp: 'fb.1.1.1', fbc: '', sourceUrl: 'https://ilovedigital.com.au/contact', source: 'Facebook', sourceDetail: 'test', landingPage: '/' };
  assert.equal(checkShape('contact', { type: 'contact', email: 'a@b.com.au', name: 'A B', business: 'B', message: 'Hi there', heardAbout: 'Google search', ...base }).ok, true);
  assert.equal(checkShape('audit', { type: 'audit', email: 'a@b.com.au', website: 'b.com.au', heardAbout: 'TikTok', ...base }).ok, true);
  assert.equal(checkShape('newsletter', { type: 'newsletter', email: 'a@b.com.au', ...base }).ok, true);
  assert.equal(checkShape('template', { type: 'template', email: 'a@b.com.au', name: 'A', ...base }).ok, true);
});

test('heardAbout is only allowed on contact and audit, and limits apply', () => {
  assert.equal(checkShape('newsletter', { type: 'newsletter', email: 'a@b.com.au', heardAbout: 'Google search' }).ok, false);
  assert.equal(checkShape('contact', { type: 'contact', email: 'a@b.com.au', name: 'A', business: 'B', message: 'Hi', source: 'x'.repeat(41) }).ok, false);
  assert.equal(checkShape('contact', { type: 'contact', email: 'a@b.com.au', name: 'A', business: 'B', message: 'Hi', heardAbout: 'x'.repeat(61) }).ok, false);
});

// ---------- Part B: article split ----------

const sections = (n: number, faq = true) =>
  ['Intro paragraph.', ...Array.from({ length: n }, (_, i) => `## Section ${i + 1}\n\nBody ${i + 1}.`), faq ? '## FAQs\n\n**Q one?**\nA one.\n\n**Q two?**\nA two.' : ''].join('\n\n');

test('fewer than four sections renders whole', () => {
  assert.equal(splitForAuditCard(sections(3)), null);
});

test('four or more sections split after the first half, never inside the FAQs', () => {
  const four = splitForAuditCard(sections(4))!;
  assert.ok(four.before.includes('## Section 2') && !four.before.includes('## Section 3'));
  assert.ok(four.after.startsWith('## Section 3'));
  const five = splitForAuditCard(sections(5))!;
  assert.ok(five.before.includes('## Section 3') && five.after.startsWith('## Section 4'));
  // FAQs always stay after the card
  assert.ok(five.after.includes('## FAQs') && !five.before.includes('## FAQs'));
});

test('FAQ headings do not count as sections, and headings inside code fences are ignored', () => {
  assert.equal(splitForAuditCard(sections(3) + '\n\n## After FAQs\n\nx'), null);
  const fenced = ['## One', '```', '## not a heading', '## also not', '```', '## Two', '## Three'].join('\n');
  assert.equal(splitForAuditCard(fenced), null);
});

test('every published article: halves rejoin to the body and FAQs are unchanged', () => {
  const dir = path.join(process.cwd(), 'content/insights');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  assert.ok(files.length > 0);
  let split = 0;
  for (const f of files) {
    const body = fs.readFileSync(path.join(dir, f), 'utf-8').replace(/^---[\s\S]*?---\n/, '');
    const s = splitForAuditCard(body);
    if (!s) continue;
    split++;
    assert.equal(`${s.before}\n${s.after}`.replace(/\s+/g, ' '), body.replace(/\s+/g, ' '), f);
    assert.ok(/^##\s/.test(s.after), `${f}: second half starts at a heading`);
    assert.equal(extractFaqs(s.before).length, 0, `${f}: no FAQs before the card`);
    assert.deepEqual(extractFaqs(s.after), extractFaqs(body), `${f}: FAQs intact`);
  }
  assert.ok(split > 0);
});

// ---------- Part C: Zernio webhook ----------

const SECRET = 'a'.repeat(64);
const sign = (raw: string, secret = SECRET) => createHmac('sha256', secret).update(raw).digest('hex');

test('signature check: right secret passes, anything else fails', () => {
  const raw = JSON.stringify({ event: 'webhook.test', id: '1' });
  assert.equal(verifySignature(raw, sign(raw), SECRET), true);
  assert.equal(verifySignature(raw, sign(raw).toUpperCase(), SECRET), true);
  assert.equal(verifySignature(raw, sign(raw, 'b'.repeat(64)), SECRET), false);
  assert.equal(verifySignature(raw + ' ', sign(raw), SECRET), false);
  assert.equal(verifySignature(raw, null, SECRET), false);
  assert.equal(verifySignature(raw, 'sha256=' + sign(raw), SECRET), false);
  assert.equal(verifySignature(raw, 'zz', SECRET), false);
});

const leadBody = (fields: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({
  id: 'evt_1',
  event: 'lead.received',
  lead: { formId: '123', leadgenId: 'lg_9', adId: null, campaignId: 'cmp_1', fields, ...extra },
});

test('parseLeadEvent reads lead.received and ignores everything else', () => {
  assert.equal(parseLeadEvent({ event: 'webhook.test', id: '1' }, null), null);
  assert.equal(parseLeadEvent('nope', null), null);
  const e = parseLeadEvent(leadBody({ email: 'A@B.com.au', full_name: 'Ann Lee', k: ['x', 'y'], n: 5 }), 'hdr_1')!;
  assert.equal(e.eventId, 'hdr_1');
  assert.equal(e.formId, '123');
  assert.equal(e.leadgenId, 'lg_9');
  assert.equal(e.adId, null);
  assert.equal(e.campaignId, 'cmp_1');
  assert.deepEqual(e.fields, { email: 'A@B.com.au', full_name: 'Ann Lee', k: 'x, y', n: '5' });
  assert.equal(parseLeadEvent(leadBody({}), null)!.eventId, 'evt_1');
});

test('unmapped form: standard keys still give name, email and phone', () => {
  const l = normaliseLead('999', { full_name: 'Ann Lee', email: 'Ann@Example.com.au', phone_number: '+61400000000', q1: 'k2' });
  assert.equal(l.known, false);
  assert.equal(l.name, 'Ann Lee');
  assert.equal(l.email, 'ann@example.com.au');
  assert.equal(l.phone, '+61400000000');
  assert.equal(l.interest, '');
  assert.match(l.formName, /Unmapped form 999/);
  assert.equal(normaliseLead('', { first_name: 'Ann', last_name: 'Lee' }).name, 'Ann Lee');
});

test('a mapped form turns option keys into labels and labels into Service Interest', () => {
  const form = { formId: 'f1', name: 'Test form', keys: { business: 'biz', website: 'site', interest: 'want' }, options: { k1: 'A new website' } };
  LEAD_FORMS.push(form);
  try {
    const l = normaliseLead('f1', { email: 'a@b.com.au', biz: 'Smith Trades', site: 'smith.com.au', want: 'k1' });
    assert.equal(l.known, true);
    assert.equal(l.business, 'Smith Trades');
    assert.equal(l.website, 'smith.com.au');
    assert.equal(l.interest, 'A new website');
    assert.equal(l.service, 'Website');
  } finally {
    LEAD_FORMS.pop();
  }
});

test('interest labels map as the Quick Wins plan says', () => {
  assert.deepEqual(INTEREST_TO_SERVICE, {
    'More enquiries': 'SEO',
    'A new website': 'Website',
    'A digital member or loyalty card': 'Digital cards',
    'A custom plugin': 'Custom plugins',
    'Not sure yet': 'SEO',
  });
});

test('route: 503 without a secret, 401 for a bad signature, 200 for webhook.test', async () => {
  const { POST } = await import('../src/app/api/zernio/lead/route');
  const post = (raw: string, sig: string | null) =>
    POST(new Request('https://ilovedigital.com.au/api/zernio/lead', { method: 'POST', body: raw, headers: sig ? { 'x-zernio-signature': sig } : {} }));
  const raw = JSON.stringify({ id: 't1', event: 'webhook.test', message: 'hi' });

  delete process.env.ZERNIO_WEBHOOK_SECRET;
  assert.equal((await post(raw, sign(raw))).status, 503);

  process.env.ZERNIO_WEBHOOK_SECRET = SECRET;
  assert.equal((await post(raw, null)).status, 401);
  assert.equal((await post(raw, sign(raw, 'c'.repeat(64)))).status, 401);
  assert.equal((await post(raw, sign(raw))).status, 200);

  // A lead with no way to notify (no SMTP in tests) must ask Zernio to retry.
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
  delete process.env.MAILERLITE_API_KEY;
  const lead = JSON.stringify(leadBody({ email: 'a@b.com.au', full_name: 'Ann Lee' }));
  assert.equal((await post(lead, sign(lead))).status, 500);
});

// ---------- Review follow-ups ----------

test('AI tools that tag utm_source count as AI search', () => {
  for (const v of ['chatgpt.com', 'chatgpt', 'perplexity', 'perplexity.ai', 'gemini', 'copilot', 'claude.ai']) {
    assert.equal(src(`?utm_source=${v}`).source, 'AI search', v);
  }
  assert.equal(src('', 'https://www.chatgpt.com/').source, 'AI search');
});

// A fake browser for recordFirstTouch/readFirstTouch.
function fakeBrowser(opts: { search?: string; referrer?: string; path?: string; store?: Map<string, string>; throws?: boolean }) {
  const store = opts.store ?? new Map<string, string>();
  const storage = {
    getItem: (k: string) => {
      if (opts.throws) throw new Error('blocked');
      return store.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (opts.throws) throw new Error('blocked');
      store.set(k, v);
    },
  };
  Object.assign(globalThis, {
    window: { location: { search: opts.search ?? '', hostname: 'ilovedigital.com.au', pathname: opts.path ?? '/' }, localStorage: storage },
    document: { referrer: opts.referrer ?? '' },
  });
  return store;
}

test('first touch is recorded once and never overwritten inside 90 days', async () => {
  const { recordFirstTouch, readFirstTouch, attributionPayload, FIRST_TOUCH_KEY } = await import('../src/lib/attribution');
  const store = fakeBrowser({ search: '?utm_source=facebook&utm_campaign=oct&email=a@b.com', path: '/audit' });
  recordFirstTouch();
  const rec = JSON.parse(store.get(FIRST_TOUCH_KEY)!);
  assert.equal(rec.source, 'Facebook');
  assert.equal(rec.landing, '/audit');
  assert.ok(!store.get(FIRST_TOUCH_KEY)!.includes('a@b.com'), 'no query string stored');

  // A later Google visit does not overwrite it.
  fakeBrowser({ referrer: 'https://www.google.com/', store });
  recordFirstTouch();
  assert.equal(readFirstTouch()!.source, 'Facebook');
  assert.deepEqual(attributionPayload(), { source: 'Facebook', sourceDetail: 'oct', landingPage: '/audit' });

  // After 90 days the next visit starts afresh.
  store.set(FIRST_TOUCH_KEY, JSON.stringify({ ...rec, at: '2020-01-01' }));
  assert.equal(readFirstTouch(), null);
  recordFirstTouch();
  assert.equal(readFirstTouch()!.source, 'Google');
});

test('blocked storage means no record and no error', async () => {
  const { recordFirstTouch, readFirstTouch, attributionPayload } = await import('../src/lib/attribution');
  fakeBrowser({ throws: true, search: '?utm_source=facebook' });
  assert.doesNotThrow(() => recordFirstTouch());
  assert.equal(readFirstTouch(), null);
  assert.deepEqual(attributionPayload(), {});
});

// Route success paths, with Gmail and MailerLite stubbed.
type Sent = { subject: string; text: string; replyTo?: string };
async function withStubs(
  mlGet: () => Promise<Response>,
  mlPost: (body: Record<string, unknown>) => Promise<Response>,
  run: (ctx: { sent: Sent[]; posts: Record<string, unknown>[] }) => Promise<void>,
) {
  // The CommonJS module object, which is what notify.ts's default import resolves to.
  const nodemailer = createRequire(import.meta.url)('nodemailer') as typeof import('nodemailer');
  const sent: Sent[] = [];
  const posts: Record<string, unknown>[] = [];
  const realCreate = nodemailer.createTransport;
  const realFetch = globalThis.fetch;
  (nodemailer as unknown as { createTransport: unknown }).createTransport = () => ({
    sendMail: async (m: Sent) => {
      sent.push(m);
      return {};
    },
  });
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    const u = String(url);
    if (u.includes('connect.mailerlite.com/api/subscribers/')) return mlGet();
    if (u.endsWith('connect.mailerlite.com/api/subscribers')) {
      const body = JSON.parse(String(init?.body));
      posts.push(body);
      return mlPost(body);
    }
    throw new Error(`unexpected fetch ${u}`);
  }) as typeof fetch;
  Object.assign(process.env, { ZERNIO_WEBHOOK_SECRET: SECRET, SMTP_USER: 'bot@ilovedigital.com.au', SMTP_PASSWORD: 'x', MAILERLITE_API_KEY: 'k', ML_GROUP_FACEBOOK_LEADS: 'grp1' });
  try {
    await run({ sent, posts });
  } finally {
    (nodemailer as unknown as { createTransport: unknown }).createTransport = realCreate;
    globalThis.fetch = realFetch;
  }
}

const ok = (body: unknown = { data: {} }, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status }));
let evt = 100;
async function postLead(fields: Record<string, unknown>, leadgenId = 'lg_9') {
  const { POST } = await import('../src/app/api/zernio/lead/route');
  const raw = JSON.stringify({ ...leadBody(fields, { leadgenId }), id: `evt_${++evt}` });
  return POST(new Request('https://ilovedigital.com.au/api/zernio/lead', { method: 'POST', body: raw, headers: { 'x-zernio-signature': sign(raw) } }));
}

test('route: a new lead is notified, then subscribed with the source fields', async () => {
  await withStubs(
    () => ok({}, 404),
    () => ok(),
    async ({ sent, posts }) => {
      const res = await postLead({ email: 'Ann@Example.com.au', full_name: 'Ann Lee', phone_number: '0400 000 000' }, 'lg_new');
      assert.equal(res.status, 200);
      assert.equal(sent.length, 1);
      assert.match(sent[0].subject, /^Facebook lead form/);
      assert.equal(sent[0].replyTo, 'ann@example.com.au');
      assert.match(sent[0].text, /Source: Facebook/);
      assert.match(sent[0].text, /Source detail: campaign cmp_1, test lead \(no ad\)/);
      assert.equal(posts.length, 1);
      const fields = posts[0].fields as Record<string, string>;
      assert.equal(fields.lead_source, 'Facebook');
      assert.equal(fields.leadgen_id, 'lg_new');
      assert.equal(fields.phone, '0400 000 000');
      assert.deepEqual(posts[0].groups, ['grp1']);
    },
  );
});

test('route: a lead already in MailerLite with the same leadgen_id is skipped', async () => {
  await withStubs(
    () => ok({ data: { email: 'ann@example.com.au', fields: { leadgen_id: 'lg_dup' } } }),
    () => ok(),
    async ({ sent, posts }) => {
      const res = await postLead({ email: 'ann@example.com.au', full_name: 'Ann Lee' }, 'lg_dup');
      assert.equal(res.status, 200);
      assert.equal(sent.length, 0);
      assert.equal(posts.length, 0);
    },
  );
});

test('route: a MailerLite failure after the notification returns 500 for a retry', async () => {
  await withStubs(
    () => ok({}, 404),
    () => ok({ message: 'down' }, 500),
    async ({ sent }) => {
      const res = await postLead({ email: 'ann@example.com.au', full_name: 'Ann Lee' }, 'lg_mlfail');
      assert.equal(res.status, 500);
      assert.equal(sent.length, 1);
    },
  );
});

test('route: a failed duplicate check still delivers, but holds the automatic audit', async () => {
  delete process.env.FB_LEAD_AUTO_AUDIT;
  await withStubs(
    () => Promise.reject(new Error('timeout')),
    () => ok(),
    async ({ sent, posts }) => {
      // An unmapped form, so the website comes through as a raw answer only and
      // the audit could not run anyway; use a mapped form to exercise the hold.
      LEAD_FORMS.push({ formId: '123', name: 'Test', keys: { website: 'site' }, options: {} });
      try {
        const res = await postLead({ email: 'ann@example.com.au', full_name: 'Ann Lee', site: 'example.com.au' }, 'lg_lookupfail');
        assert.equal(res.status, 200);
        assert.equal(sent.length, 1);
        assert.match(sent[0].text, /Audit: Not sent automatically/);
        assert.equal(posts.length, 1);
      } finally {
        LEAD_FORMS.pop();
      }
    },
  );
});

test('route: a lead with no email is still notified and not subscribed', async () => {
  await withStubs(
    () => ok({}, 404),
    () => ok(),
    async ({ sent, posts }) => {
      const res = await postLead({ full_name: 'No Email' }, 'lg_noemail');
      assert.equal(res.status, 200);
      assert.equal(sent.length, 1);
      assert.match(sent[0].text, /Warning: No valid email/);
      assert.equal(posts.length, 0);
    },
  );
});

test('the live audit form is mapped by its real keys', () => {
  const l = normaliseLead('1992044085093369', {
    email: 'owner@smithtrades.com.au',
    full_name: 'Brett Smith',
    phone_number: '+61400000000',
    business_name: 'Smith Trades',
    website_address: 'smithtrades.com.au',
    'what_are_you_most_interested_in?': 'A new website',
  });
  assert.equal(l.known, true);
  assert.equal(l.formName, 'ILD — Free Website Audit (Oct 2026)');
  assert.equal(l.business, 'Smith Trades');
  assert.equal(l.website, 'smithtrades.com.au');
  assert.equal(l.interest, 'A new website');
  assert.equal(l.service, 'Website');
});
