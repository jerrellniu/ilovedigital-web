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
  assert.deepEqual(f.mailerlite, { source: 'Facebook', source_detail: 'oct-audit', heard_about: 'A friend or referral' });
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
