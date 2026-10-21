// Server side of the Meta Pixel: the Conversions API.
//
// Sends the same event the browser fires, with the same event ID, so Meta counts a
// lead once even when an ad blocker stopped the browser event. Runs after the lead is
// already safe in MailerLite and the notification, and never throws, so a Meta outage
// can never cost a lead.
//
// What goes to Meta is limited on purpose: a hashed email, the IP, the user agent and
// the Pixel's own cookie IDs. Never phone, name, business or message, and never a
// value or currency, because nothing is sold online. The privacy policy says exactly
// this ("Meta advertising tools"), so change both together.

import { createHash, randomUUID } from 'node:crypto';
import { clientKey } from '@/lib/ratelimit';

/** Graph API version. Checked against Meta's changelog 21 October 2026 (v26.0, July 2026). */
const GRAPH_VERSION = 'v26.0';
const TIMEOUT_MS = 3000;

export type MetaServerEvent = 'Lead' | 'CompleteRegistration';

export interface MetaEventInput {
  eventName: MetaServerEvent;
  email: string;
  req: Request;
  /** From the request body. Each is optional: the form may predate this build. */
  eventId?: unknown;
  fbp?: unknown;
  fbc?: unknown;
  sourceUrl?: unknown;
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined);

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/**
 * The page the form was sent from. Only http(s), and any `email` parameter is removed:
 * Meta can restrict a dataset that receives personal data in URLs.
 */
function sourceUrlOf(raw: unknown, req: Request): string | undefined {
  const value = str(raw) ?? req.headers.get('referer') ?? undefined;
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
    url.searchParams.delete('email');
    return url.toString();
  } catch {
    return undefined;
  }
}

export async function sendMetaEvent(input: MetaEventInput): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return;

  try {
    const ip = clientKey(input.req);
    const userAgent = input.req.headers.get('user-agent');
    const fbp = str(input.fbp);
    const fbc = str(input.fbc);

    const userData: Record<string, unknown> = { em: [sha256(input.email.trim().toLowerCase())] };
    if (ip && ip !== 'unknown') userData.client_ip_address = ip;
    if (userAgent) userData.client_user_agent = userAgent;
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    const event: Record<string, unknown> = {
      event_name: input.eventName,
      event_id: str(input.eventId) ?? randomUUID(),
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: userData,
    };
    const sourceUrl = sourceUrlOf(input.sourceUrl, input.req);
    if (sourceUrl) event.event_source_url = sourceUrl;

    // The token travels in the body, not the URL, so it never lands in a request log.
    const body: Record<string, unknown> = { data: [event], access_token: token };
    if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );
      if (!res.ok) {
        // Meta's error carries a message and code, never our token or the hashed email.
        const data = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number } };
        console.error('[meta-capi] event rejected:', {
          event: input.eventName,
          status: res.status,
          code: data.error?.code,
          message: data.error?.message,
        });
      }
    } finally {
      clearTimeout(timer);
    }
  } catch (e) {
    console.error('[meta-capi] event not sent:', { event: input.eventName, error: (e as Error).name });
  }
}
