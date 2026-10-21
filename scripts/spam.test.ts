// Tests for the form spam defence in src/lib/spam.ts.
//   npx tsx --test scripts/spam.test.ts
//
// The 52 bot subscribers from the August 2026 campaign were deleted from MailerLite,
// so the bot cases here are rebuilt from the signature recorded in the Notion handover
// (19 August 2026): random consonant-string names, a random string plus " LLC" as the
// company, and a message of random characters or a bare URL. The generated set uses a
// fixed seed so the test is deterministic.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkShape, scoreContent, looksRandom, type FormType } from '../src/lib/spam';

type Payload = { email: string; name?: string; business?: string; website?: string; message?: string; type: FormType };

// Real enquiry shapes. Every one of these must pass.
const REAL: Payload[] = [
  // The audit refused on 19 October 2026 that prompted this test.
  { type: 'audit', email: 'jerrell@ilovedigital.com.au', name: 'Jerrell Niu', business: 'Evolved Solar', website: 'https://www.evolvedsolar.com.au/', message: 'Website check' },
  // The awkward real shapes verified in August.
  { type: 'contact', email: 'john@schmidtplumbing.com.au', name: 'John Schmidt', business: 'Schmidt Plumbing', message: 'Can you quote a new website for us?' },
  { type: 'contact', email: 'khanh@nguyenwrights.com.au', name: 'Khanh Nguyen', business: 'Nguyen Wrights Pty Ltd', message: 'Our site is slow, can you help?' },
  { type: 'contact', email: 'ops@acme-us.com', name: 'Dana Wright', business: 'Acme Holdings LLC', message: 'We want a Shopify store built.' },
  // Short audit notes a real person types.
  ...['SEO check', 'Speed check', 'Quick check', 'Help', 'Check my site', 'Struggling with leads', 'Shopify store', 'WordPress site', 'Trust signals', 'Growth', 'Fresh start', 'Brand refresh', 'Strict deadline', 'thanks'].map(
    (message): Payload => ({ type: 'audit', email: 'owner@example.com.au', name: 'Brett Smith', business: 'Smith Trades', website: 'example.com.au', message }),
  ),
  // Names with few vowels, paired with a short note.
  ...['Christopher Lynch', 'Glenn Brown', 'Scott Grant', 'Krzysztof Kowalczyk', 'Dwight Knight', 'Lachlan Strachan', 'Gwyneth Chen'].map(
    (name): Payload => ({ type: 'audit', email: 'hi@example.com.au', name, business: 'Brisbane Plumbing', website: 'example.com.au', message: 'Website check' }),
  ),
];

let seed = 1508;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const randomWord = (min = 6, spread = 5) =>
  Array.from({ length: min + Math.floor(rnd() * spread) }, () => LETTERS[Math.floor(rnd() * 26)]).join('');
const cap = (w: string) => w[0].toUpperCase() + w.slice(1);

function botPayload(type: FormType): Payload {
  const name = `${cap(randomWord())} ${cap(randomWord())}`;
  const business = `${cap(randomWord())} LLC`;
  const message = rnd() < 0.5 ? `https://${randomWord()}.com/${randomWord()}` : Array.from({ length: 2 + Math.floor(rnd() * 6) }, () => randomWord(4, 7)).join(' ');
  const email = rnd() < 0.5 ? `${randomWord(2, 1)}.${randomWord(2, 1)}.${randomWord(2, 1)}.${randomWord(2, 1)}.${randomWord(2, 1)}@gmail.com` : `purchasing@${randomWord()}.com`;
  return type === 'audit' ? { type, email, name, business, website: `https://${randomWord()}.com`, message } : { type, email, name, business, message };
}

test('real enquiry shapes pass the content score', () => {
  for (const p of REAL) {
    const v = scoreContent(p);
    assert.equal(v.ok, true, `${p.name} / ${p.message}: ${v.reason}`);
  }
});

test('the 19 October false positive no longer scores', () => {
  assert.equal(looksRandom('Jerrell Niu'), false);
  assert.equal(looksRandom('Website check', true), false);
});

// The content score is the soft layer. Turnstile is what holds against a bot, and the
// August campaign posted straight at the API with no token. So URL-carrying payloads
// must all fail here, and random-text payloads must mostly fail. Measured 19 October
// 2026: 94% (contact) and 93% (audit) refused on content alone, against 100% before
// the retune, which also refused about 80% of realistic short audit requests.
test('campaign-shaped bot payloads are refused by the content score', () => {
  for (const type of ['contact', 'audit'] as const) {
    let random = 0;
    let randomRefused = 0;
    for (let i = 0; i < 1000; i++) {
      const p = botPayload(type);
      const refused = !scoreContent(p).ok;
      if (p.message?.startsWith('https://')) {
        assert.equal(refused, true, JSON.stringify(p));
      } else {
        random++;
        if (refused) randomRefused++;
      }
    }
    assert.ok(randomRefused / random >= 0.9, `${type}: ${randomRefused}/${random} random-text bot payloads refused`);
  }
});

test('the documented bot strings still read as random', () => {
  assert.equal(looksRandom('Pdlvygb Kqynkuewn'), true);
  assert.equal(looksRandom('Vpwpuawk'), true);
  assert.equal(looksRandom('xqzvbk pdlvyg', true), true);
});

// The Meta Pixel fields ride on every form (src/lib/meta.ts). checkShape answers a
// drop with 200, so if these were not allowed every real lead would vanish silently.
const META = {
  eventId: '0b8e7c1e-4a8f-4f2e-9a57-6c1d2e3f4a5b',
  fbp: 'fb.1.1729468800000.1234567890',
  fbc: 'fb.1.1729468800000.IwAR0abcDEF',
  sourceUrl: 'https://ilovedigital.com.au/contact',
};

test('real payloads carrying the Meta fields pass the shape check', () => {
  const payloads: [FormType, Record<string, unknown>][] = [
    ['contact', { type: 'contact', email: 'a@b.com.au', name: 'Brett Smith', business: 'Smith Trades', message: 'Quote please', hp: '', token: '', ...META }],
    ['audit', { type: 'audit', email: 'a@b.com.au', website: 'example.com.au', name: 'Brett Smith', business: 'Smith Trades', message: '', hp: '', token: '', ...META }],
    ['newsletter', { type: 'newsletter', email: 'a@b.com.au', hp: '', token: '', ...META }],
    ['template', { type: 'template', email: 'a@b.com.au', name: 'Brett', hp: '', token: '', ...META, fbp: '', fbc: '' }],
  ];
  for (const [type, body] of payloads) {
    const v = checkShape(type, body);
    assert.equal(v.ok, true, `${type}: ${v.reason}`);
  }
});

test('an unknown field still drops alongside the Meta fields', () => {
  const v = checkShape('newsletter', { type: 'newsletter', email: 'a@b.com.au', ...META, phone: '0400000000' });
  assert.equal(v.ok, false);
  assert.match(v.reason!, /unexpected field "phone"/);
});

test('the Meta fields have length limits', () => {
  assert.equal(checkShape('newsletter', { type: 'newsletter', email: 'a@b.com.au', eventId: 'x'.repeat(65) }).ok, false);
  assert.equal(checkShape('newsletter', { type: 'newsletter', email: 'a@b.com.au', sourceUrl: 'x'.repeat(501) }).ok, false);
});
