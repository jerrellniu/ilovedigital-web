// First-touch lead source. Records how a visitor first arrived, in their own
// browser, so every form can say which channel the lead came from.
//
// Why: in October 2026 five of the seven Leads rows had no Lead Source, and the
// Meta ads were about to start. Without a source on every lead we cannot compare
// paid social with SEO. Spec: "Build Brief — Lead Source, Article Audit CTA and
// Meta Form Leads (October 2026)" in Notion, Part A.
//
// Rules:
//   - First touch wins for 90 days. A second visit from Google does not overwrite
//     an earlier Facebook arrival; after 90 days the next visit starts afresh.
//   - Only the landing PATH is kept, never the query string, so no email address
//     or click ID is ever stored.
//   - Storage can be blocked or throw (private windows, cleared site data). Every
//     read and write is wrapped: a blocked localStorage means no record, never an
//     error.
//
// `source` values match the Lead Source options in the Notion Leads database.

export const FIRST_TOUCH_KEY = 'ild-first-touch';
const TTL_MS = 90 * 24 * 60 * 60 * 1000;
const DETAIL_MAX = 100;

export type LeadSource =
  | 'Facebook'
  | 'Instagram'
  | 'TikTok'
  | 'LinkedIn'
  | 'Google'
  | 'AI search'
  | 'Referral'
  | 'Direct'
  | 'Other';

export interface FirstTouch {
  source: LeadSource;
  detail: string;
  landing: string;
  /** ISO date the record was made. */
  at: string;
}

const UTM_SOURCES: Record<string, LeadSource> = {
  facebook: 'Facebook',
  fb: 'Facebook',
  meta: 'Facebook',
  instagram: 'Instagram',
  ig: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  google: 'Google',
};

const CLICK_IDS: [string, LeadSource][] = [
  ['fbclid', 'Facebook'],
  ['gclid', 'Google'],
  ['ttclid', 'TikTok'],
  ['li_fat_id', 'LinkedIn'],
];

const AI_HOSTS = new Set([
  'chatgpt.com',
  'chat.openai.com',
  'perplexity.ai',
  'www.perplexity.ai',
  'gemini.google.com',
  'copilot.microsoft.com',
  'claude.ai',
]);

/** Referrer host to channel. Checked in order: AI hosts first, because gemini.google.com is a Google host. */
function sourceFromHost(host: string): LeadSource {
  const h = host.toLowerCase();
  if (AI_HOSTS.has(h)) return 'AI search';
  if (/(^|\.)google\.[a-z.]+$/.test(h) || /(^|\.)bing\.com$/.test(h)) return 'Google';
  if (h === 'facebook.com' || h.endsWith('.facebook.com')) return 'Facebook';
  if (h === 'instagram.com' || h.endsWith('.instagram.com')) return 'Instagram';
  if (h === 'tiktok.com' || h.endsWith('.tiktok.com')) return 'TikTok';
  if (h === 'linkedin.com' || h.endsWith('.linkedin.com') || h === 'lnkd.in') return 'LinkedIn';
  return 'Referral';
}

const cap = (s: string) => s.slice(0, DETAIL_MAX);

/**
 * Work out the channel from what the first page view can see. Pure, so it can be
 * tested without a browser.
 *
 * Order: utm_source, then click IDs, then the referrer host, then Direct. A
 * referrer from our own site (storage was cleared mid-visit) counts as Direct.
 */
export function detectSource(input: { search: string; referrer: string; selfHost: string }): { source: LeadSource; detail: string } {
  const params = new URLSearchParams(input.search);
  const campaign = cap(params.get('utm_campaign')?.trim() ?? '');

  const utm = params.get('utm_source')?.trim().toLowerCase();
  if (utm) return { source: UTM_SOURCES[utm] ?? 'Other', detail: campaign };

  for (const [key, source] of CLICK_IDS) {
    if (params.has(key)) return { source, detail: campaign };
  }

  if (input.referrer) {
    let host = '';
    try {
      host = new URL(input.referrer).hostname.toLowerCase();
    } catch {
      host = '';
    }
    const self = input.selfHost.toLowerCase().replace(/^www\./, '');
    if (host && host.replace(/^www\./, '') !== self) {
      const source = sourceFromHost(host);
      return { source, detail: source === 'Referral' ? cap(host) : campaign };
    }
  }

  return { source: 'Direct', detail: campaign };
}

/** The stored record, or null when there is none, it has expired, or storage is blocked. */
export function readFirstTouch(): FirstTouch | null {
  try {
    const raw = window.localStorage.getItem(FIRST_TOUCH_KEY);
    if (!raw) return null;
    const rec = JSON.parse(raw) as FirstTouch;
    if (!rec?.source || !rec.at) return null;
    if (Date.now() - new Date(rec.at).getTime() > TTL_MS) return null;
    return rec;
  } catch {
    return null;
  }
}

/** Called once per page load. Writes a record only when there is no live one. */
export function recordFirstTouch(): void {
  if (typeof window === 'undefined') return;
  if (readFirstTouch()) return;
  const { source, detail } = detectSource({
    search: window.location.search,
    referrer: document.referrer,
    selfHost: window.location.hostname,
  });
  const rec: FirstTouch = {
    source,
    detail,
    landing: window.location.pathname.slice(0, 200),
    at: new Date().toISOString().slice(0, 10),
  };
  try {
    window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(rec));
  } catch {
    // Storage blocked: no record, and forms send no source.
  }
}

/** Fields every form adds to its payload. Empty when there is no record. */
export function attributionPayload(): { source?: string; sourceDetail?: string; landingPage?: string } {
  const rec = readFirstTouch();
  if (!rec) return {};
  const out: { source?: string; sourceDetail?: string; landingPage?: string } = { source: rec.source.slice(0, 40) };
  if (rec.detail) out.sourceDetail = rec.detail.slice(0, 100);
  if (rec.landing) out.landingPage = rec.landing.slice(0, 200);
  return out;
}
