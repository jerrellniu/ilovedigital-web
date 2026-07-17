// Server-only MailerLite client. Uses the MailerLite Connect API.
// Requires MAILERLITE_API_KEY in the environment (never commit it).

const API = 'https://connect.mailerlite.com/api';

export interface SubscribeParams {
  email: string;
  fields?: Record<string, string>;
  groups?: string[];
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
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MailerLite ${res.status}: ${text}`);
  }
  return res.json();
}
