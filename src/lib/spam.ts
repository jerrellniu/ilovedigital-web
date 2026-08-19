// Server-side spam defence for /api/subscribe.
//
// Why this exists: the honeypot in src/components/forms/Honeypot.tsx only helps
// against a bot that drives the rendered form. In August 2026 the site was hit by
// a bot POSTing JSON straight at the API route, so the honeypot field simply never
// appeared in the payload and every submission sailed through to MailerLite and
// the auto-reply. Anything that protects this endpoint has to run on the server
// and has to assume the client was never executed.
//
// Three layers, cheapest first:
//   1. Shape — each form type may only send the fields its component actually
//      sends. A "contact" payload carrying `website` did not come from ContactForm.
//   2. Origin — a browser submitting our form always sends an Origin we recognise.
//   3. Content — a weighted score over the values themselves, tuned so that no
//      single soft signal can reject a real enquiry on its own.
//
// The content score is deliberately forgiving. A missed spam submission costs one
// junk record; a rejected enquiry costs a client. Every threshold below was checked
// against the real subscriber list and the 52 known-bot payloads.

export type FormType = 'newsletter' | 'audit' | 'contact';

/** Fields each form component actually sends, beyond `email`, `type` and `hp`. */
const ALLOWED: Record<FormType, readonly string[]> = {
  newsletter: [],
  audit: ['website', 'name', 'business', 'message'],
  contact: ['name', 'business', 'message'],
};

/** Fields the form marks `required`, so a real submission always carries them. */
const REQUIRED: Record<FormType, readonly string[]> = {
  newsletter: [],
  audit: ['website'],
  contact: ['name', 'business', 'message'],
};

/** Upper bounds. Generous for a person, closed to anyone pasting a payload. */
const MAX_LENGTH: Record<string, number> = {
  email: 254,
  name: 100,
  business: 120,
  website: 500,
  message: 5000,
};

export function isFormType(value: unknown): value is FormType {
  return value === 'newsletter' || value === 'audit' || value === 'contact';
}

const URL_PATTERN = /(https?:\/\/|www\.)/i;

// `y` counts as a vowel here. Without it, ordinary surnames (Byron, Lynch) read as
// consonant runs and score as random.
const VOWEL = /[aeiouy]/i;

/**
 * Does one word look machine-generated? Tuned on both sides: it catches "Pdlvygb"
 * and "Vpwpuawk", and leaves "Schmidt", "Nguyen", "Wright" and "Thornley" alone.
 * Words under four letters are never judged — initials and "LLC" are not evidence.
 */
function wordLooksRandom(word: string): boolean {
  const w = word.replace(/[^a-z]/gi, '');
  if (w.length < 4) return false;
  if (!VOWEL.test(w)) return true;
  if (/[^aeiouy]{4,}/i.test(w)) return true;
  const vowels = (w.match(/[aeiouy]/gi) ?? []).length;
  return vowels / w.length < 0.3;
}

/** True when at least half the words in a value look machine-generated. */
export function looksRandom(value: string): boolean {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  return words.filter(wordLooksRandom).length / words.length >= 0.5;
}

export interface Verdict {
  ok: boolean;
  /** Internal only. Logged, never returned to the browser. */
  reason?: string;
}

const PASS: Verdict = { ok: true };

/**
 * Shape check. Runs before anything expensive and before any value is trusted.
 * An unexpected key is a hard reject: it means the payload was hand-built.
 */
export function checkShape(type: FormType, body: Record<string, unknown>): Verdict {
  const allowed = new Set<string>([...ALLOWED[type], 'email', 'type', 'hp', 'token']);

  for (const [key, value] of Object.entries(body)) {
    if (!allowed.has(key)) {
      return { ok: false, reason: `unexpected field "${key}" for type "${type}"` };
    }
    if (value !== undefined && value !== null && typeof value !== 'string') {
      return { ok: false, reason: `field "${key}" is not a string` };
    }
    const max = MAX_LENGTH[key];
    if (max && typeof value === 'string' && value.length > max) {
      return { ok: false, reason: `field "${key}" exceeds ${max} characters` };
    }
  }

  for (const key of REQUIRED[type]) {
    const value = body[key];
    if (typeof value !== 'string' || value.trim() === '') {
      return { ok: false, reason: `required field "${key}" is missing for type "${type}"` };
    }
  }

  return PASS;
}

/**
 * Content score. Each signal is weak on its own by design — a real enquiry that
 * happens to trip one or two of these still gets through. Only an accumulation
 * rejects. Threshold and weights are documented inline so they can be retuned
 * against evidence rather than by feel.
 */
export function scoreContent(input: {
  email: string;
  name?: string;
  business?: string;
  website?: string;
  message?: string;
  type: FormType;
}): Verdict {
  const reasons: string[] = [];
  let score = 0;

  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(`${reason} (+${points})`);
  };

  const name = input.name?.trim() ?? '';
  const business = input.business?.trim() ?? '';
  const message = input.message?.trim() ?? '';

  // Soft on their own: a surname like "Schmidt" reads as random, and plenty of
  // legitimate businesses are an LLC. Together with a junk message they convict.
  if (name && looksRandom(name)) add(1, 'name looks machine-generated');
  if (business && looksRandom(business)) add(1, 'business looks machine-generated');
  if (business && /\bL\.?L\.?C\.?\b/i.test(business)) add(2, 'business is an LLC');

  if (message) {
    if (looksRandom(message)) add(3, 'message looks machine-generated');
    // A person writing to us uses spaces. Twelve unbroken characters is a token.
    if (!/\s/.test(message) && message.length >= 12) add(2, 'message is a single long token');
  }

  // Links are the point of this spam. On the audit form a URL is the whole request,
  // so only score it where the form gives no reason to include one.
  if (input.type !== 'audit' && URL_PATTERN.test(`${name} ${business} ${message}`)) {
    add(2, 'link in a field that should not contain one');
  }

  // Gmail ignores dots, so a bot mints unlimited addresses from one mailbox.
  const local = input.email.split('@')[0] ?? '';
  if ((local.match(/\./g) ?? []).length >= 4) add(1, 'email local part is dot-stuffed');

  // Four is the point at which no single signal, and no plausible pair of soft
  // signals from a real person, can reach it on its own.
  if (score >= 4) {
    return { ok: false, reason: `content score ${score}: ${reasons.join(', ')}` };
  }
  return PASS;
}

const ALLOWED_HOSTS = new Set([
  'ilovedigital.com.au',
  'www.ilovedigital.com.au',
]);

/**
 * Origin check. A browser posting our own form always sends Origin; a script
 * usually sends none. Vercel preview deployments and local dev are allowed so the
 * form stays testable, and a missing Origin is rejected only in production.
 */
export function checkOrigin(req: Request): Verdict {
  const origin = req.headers.get('origin') ?? req.headers.get('referer');

  if (!origin) {
    if (process.env.NODE_ENV !== 'production') return PASS;
    return { ok: false, reason: 'no Origin or Referer header' };
  }

  let host: string;
  try {
    host = new URL(origin).hostname;
  } catch {
    return { ok: false, reason: `unparseable Origin "${origin}"` };
  }

  if (ALLOWED_HOSTS.has(host)) return PASS;
  if (host.endsWith('.vercel.app')) return PASS;
  if (process.env.NODE_ENV !== 'production' && (host === 'localhost' || host === '127.0.0.1')) {
    return PASS;
  }

  return { ok: false, reason: `Origin "${host}" is not allowed` };
}
