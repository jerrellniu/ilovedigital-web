// In-memory rate limit for /api/subscribe.
//
// Scope note, so this is not mistaken for more than it is: each serverless instance
// keeps its own counter, so a caller spread across instances gets a higher effective
// limit than the number below suggests. That is fine for what this is — a brake on
// a single host hammering one warm instance. The real gate is Turnstile plus the
// origin and shape checks in spam.ts; this exists so a burst cannot run up a
// MailerLite bill before those reject it. Move to Vercel KV if a campaign ever
// gets past the other layers and needs a limit that actually holds.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

/** Drop callers whose entire window has aged out, so the map cannot grow forever. */
function evictStale(now: number) {
  for (const [key, times] of hits) {
    if (times.every((t) => now - t > WINDOW_MS)) hits.delete(key);
  }
}

export function clientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export function rateLimit(key: string): { ok: boolean; retryAfterSeconds?: number } {
  const now = Date.now();

  if (hits.size > 5000) evictStale(now);

  const recent = (hits.get(key) ?? []).filter((t) => now - t <= WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = recent[0];
    hits.set(key, recent);
    return { ok: false, retryAfterSeconds: Math.ceil((WINDOW_MS - (now - oldest)) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);
  return { ok: true };
}
