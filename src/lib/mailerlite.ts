// Server-only MailerLite client. Uses the MailerLite Connect API.
// Requires MAILERLITE_API_KEY in the environment (never commit it).

const API = 'https://connect.mailerlite.com/api';

export interface SubscribeParams {
  email: string;
  fields?: Record<string, string>;
  groups?: string[];
  /** Abort after this long. Unset waits as long as fetch does. */
  timeoutMs?: number;
}

export async function subscribe(params: SubscribeParams) {
  const key = process.env.MAILERLITE_API_KEY;
  if (!key) throw new Error('MAILERLITE_API_KEY is not set');

  const res = await fetch(`${API}/subscribers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      email: params.email,
      fields: params.fields,
      groups: params.groups,
    }),
    signal: params.timeoutMs ? AbortSignal.timeout(params.timeoutMs) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MailerLite ${res.status}: ${text}`);
  }
  return res.json();
}

export interface SubscriberRecord {
  email: string;
  fields: Record<string, string | number | null>;
}

/**
 * Look a subscriber up by email. Resolves null when there is no such subscriber.
 * Throws on any other failure, so the caller decides whether a failed lookup
 * should block. `timeoutMs` keeps a slow API from eating a webhook's time budget.
 */
export async function getSubscriber(email: string, timeoutMs = 2000): Promise<SubscriberRecord | null> {
  const key = process.env.MAILERLITE_API_KEY;
  if (!key) throw new Error('MAILERLITE_API_KEY is not set');

  const res = await fetch(`${API}/subscribers/${encodeURIComponent(email)}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`MailerLite ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: SubscriberRecord };
  return json.data ?? null;
}
