// Cloudflare Turnstile verification.
//
// This is the layer that actually holds. The shape, origin and content checks in
// spam.ts stop the campaign we saw, but they are heuristics and a determined bot
// can be rewritten to satisfy all three. A Turnstile token cannot be forged from
// outside a browser.
//
// Enforcement is conditional on TURNSTILE_SECRET_KEY being set. That is deliberate:
// it lets this ship and start blocking on the heuristics immediately, and turns
// into a hard gate the moment the keys are added in Vercel — no second deploy, no
// window where the form is broken because a key is missing.

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(
  token: unknown,
  ip: string,
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };

  if (typeof token !== 'string' || token === '') {
    return { ok: false, reason: 'no Turnstile token in the payload' };
  }

  const form = new URLSearchParams({ secret, response: token });
  if (ip && ip !== 'unknown') form.set('remoteip', ip);

  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body: form });
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (data.success) return { ok: true };
    return { ok: false, reason: `Turnstile rejected: ${(data['error-codes'] ?? []).join(', ')}` };
  } catch (e) {
    // Cloudflare being unreachable must not take the form down with it. The other
    // layers still apply, so failing open here is a narrow, deliberate exposure.
    console.error('[turnstile] verification request failed, allowing through:', e);
    return { ok: true };
  }
}
