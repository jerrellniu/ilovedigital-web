// Browser side of the Meta Pixel. The server side (Conversions API) is meta-capi.ts.
//
// Every lead fires twice: once here through fbq, once from our server. Both carry the
// same event ID, so Meta counts the lead once and keeps whichever arrived with better
// match data. An ad blocker removes fbq, but the server event still lands.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export type MetaEventName = 'PageView' | 'Lead' | 'CompleteRegistration' | 'Contact';

/** sessionStorage key for the email handed from the Home audit band to /audit. */
export const AUDIT_EMAIL_KEY = 'ild-audit-email';

export function newEventId(): string {
  return crypto.randomUUID();
}

function readCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * The Pixel's browser ID (_fbp) and click ID (_fbc). On the landing page of an ad
 * click the Pixel may not have written _fbc yet, so build it from fbclid in the
 * format Meta documents: fb.1.<milliseconds>.<fbclid>.
 */
export function metaCookies(): { fbp: string; fbc: string } {
  const fbp = readCookie('_fbp');
  let fbc = readCookie('_fbc');
  if (!fbc) {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  }
  return { fbp, fbc };
}

/** The fields every form adds to its POST so the server event matches this one. */
export function metaPayload(eventId: string): { eventId: string; fbp: string; fbc: string; sourceUrl: string } {
  return { eventId, ...metaCookies(), sourceUrl: window.location.href.slice(0, 500) };
}

/** Does nothing when fbq is absent: no Pixel ID set, or an ad blocker removed it. */
export function track(eventName: MetaEventName, eventId: string): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', eventName, {}, { eventID: eventId });
}
