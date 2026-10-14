// Crawl: the homepage plus up to ten more pages, chosen from the sitemap first and
// the homepage's own links second. Everything here measures; nothing judges. The
// judgements live in checks.ts.

import * as cheerio from 'cheerio';
import { safeFetch, BlockedUrlError, type SafeResponse } from './safe-fetch';
import type { PageSnapshot } from './types';

export const MAX_EXTRA_PAGES = 10;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * One retry, after a pause, for answers that usually mean "slow down" rather than
 * "broken": a transport error, 429, or a 5xx. Small business hosts and their
 * firewalls throttle bursts, and a report must not flip between runs because of it.
 */
export async function fetchPolitely(url: string, options: Parameters<typeof safeFetch>[1] = {}): Promise<SafeResponse> {
  try {
    const r = await safeFetch(url, options);
    if (r.status !== 429 && r.status < 500) return r;
  } catch (e) {
    if (e instanceof BlockedUrlError) throw e;
  }
  await sleep(1200);
  return safeFetch(url, options);
}

/** www and bare host are the same site for our purposes. */
export function sameSite(a: string, b: string): boolean {
  const strip = (h: string) => h.toLowerCase().replace(/^www\./, '');
  return strip(a) === strip(b);
}

const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|avif|mp4|mov|webm|zip|docx?|xlsx?|pptx?|mp3|ico|css|js|xml|txt|json)(\?|$)/i;

export function canonicalPageUrl(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    u.hash = '';
    // Tracking parameters create duplicate URLs for one page.
    for (const k of [...u.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_|ref$)/i.test(k)) u.searchParams.delete(k);
    }
    return u.toString();
  } catch {
    return null;
  }
}

export function parsePage(res: SafeResponse): PageSnapshot {
  const $ = cheerio.load(res.body);
  const base = res.finalUrl;
  const host = new URL(base).hostname;

  const schemaTypes = new Set<string>();
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text().trim());
      const walk = (node: unknown) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) return node.forEach(walk);
        const obj = node as Record<string, unknown>;
        const t = obj['@type'];
        if (typeof t === 'string') schemaTypes.add(t);
        if (Array.isArray(t)) t.forEach((x) => typeof x === 'string' && schemaTypes.add(x));
        if (obj['@graph']) walk(obj['@graph']);
        for (const v of Object.values(obj)) if (v && typeof v === 'object') walk(v);
      };
      walk(parsed);
    } catch {
      // Malformed JSON-LD is itself a finding, but not one worth crashing over.
      schemaTypes.add('(invalid JSON-LD)');
    }
  });

  const internal = new Set<string>();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return;
    const abs = canonicalPageUrl(href, base);
    if (!abs) return;
    const u = new URL(abs);
    if (sameSite(u.hostname, host) && !SKIP_EXT.test(u.pathname)) internal.add(abs);
  });

  const isHttps = base.startsWith('https:');
  let mixed = 0;
  if (isHttps) {
    $('img[src], script[src], iframe[src], link[rel="stylesheet"][href], source[src], video[src], audio[src]').each(
      (_, el) => {
        const v = $(el).attr('src') || $(el).attr('href') || '';
        if (/^http:\/\//i.test(v)) mixed++;
      },
    );
  }

  const imgs = $('img');
  let missingAlt = 0;
  imgs.each((_, el) => {
    const alt = $(el).attr('alt');
    // alt="" is correct for decorative images, so only a missing attribute counts.
    if (alt === undefined) missingAlt++;
  });

  const robots = ($('meta[name="robots"]').attr('content') || '') + ' ' + (res.headers['x-robots-tag'] || '');

  $('script, style, noscript, template, svg').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();

  const clean = (s: string | undefined) => {
    const t = (s || '').replace(/\s+/g, ' ').trim();
    return t || null;
  };

  return {
    url: base,
    status: res.status,
    title: clean($('head title').first().text()),
    description: clean($('meta[name="description"]').attr('content')),
    h1: $('h1')
      .map((_, el) => clean($(el).text()) || '')
      .get()
      .filter(Boolean),
    canonical: clean($('link[rel="canonical"]').attr('href')),
    noindex: /noindex/i.test(robots),
    lang: clean($('html').attr('lang')),
    viewport: $('meta[name="viewport"]').length > 0,
    wordCount: text ? text.split(' ').length : 0,
    imagesTotal: imgs.length,
    imagesMissingAlt: missingAlt,
    schemaTypes: [...schemaTypes],
    ogTitle: $('meta[property="og:title"]').length > 0,
    ogImage: $('meta[property="og:image"]').length > 0,
    internalLinks: [...internal],
    mixedContent: mixed,
    ms: res.ms,
  };
}

export interface RobotsInfo {
  found: boolean;
  status: number;
  sitemaps: string[];
  /** True when User-agent: * has Disallow: / with no Allow to reopen it. */
  blocksAll: boolean;
  /** AI crawlers that are fully disallowed. */
  blockedAiBots: string[];
}

export const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

/**
 * A small robots.txt reader: groups of user-agents, and whether each group fully
 * disallows the site. Enough to answer "is everything blocked" and "which AI
 * crawlers are blocked" without pretending to be a complete matcher.
 */
export function parseRobots(body: string): Omit<RobotsInfo, 'found' | 'status'> {
  const sitemaps: string[] = [];
  const groups: { agents: string[]; disallowAll: boolean; allowRoot: boolean }[] = [];
  let current: { agents: string[]; disallowAll: boolean; allowRoot: boolean } | null = null;
  let lastWasAgent = false;

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    if (!line) continue;
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'sitemap') {
      sitemaps.push(value);
      continue;
    }
    if (key === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], disallowAll: false, allowRoot: false };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (key === 'disallow' && value === '/') current.disallowAll = true;
    if (key === 'allow' && (value === '/' || value === '/$' || value === '')) current.allowRoot = true;
  }

  const blocked = (agent: string) => {
    const g = groups.find((x) => x.agents.includes(agent.toLowerCase()));
    const target = g ?? groups.find((x) => x.agents.includes('*'));
    return Boolean(target && target.disallowAll && !target.allowRoot);
  };

  return {
    sitemaps,
    blocksAll: blocked('*'),
    blockedAiBots: AI_BOTS.filter(blocked),
  };
}

export async function fetchRobots(origin: string): Promise<RobotsInfo> {
  try {
    const res = await safeFetch(`${origin}/robots.txt`, { timeoutMs: 8000, maxBytes: 512 * 1024 });
    const isText = !/text\/html/i.test(res.headers['content-type'] || '');
    if (res.status === 200 && isText) {
      return { found: true, status: res.status, ...parseRobots(res.body) };
    }
    return { found: false, status: res.status, sitemaps: [], blocksAll: false, blockedAiBots: [] };
  } catch {
    return { found: false, status: 0, sitemaps: [], blocksAll: false, blockedAiBots: [] };
  }
}

export interface SitemapInfo {
  found: boolean;
  url: string | null;
  urlCount: number;
  urls: string[];
  /** Found, but we could not read any URLs from it (or from the sitemaps it lists). */
  unreadable: boolean;
}

function locs(xml: string): string[] {
  const out: string[] = [];
  const re = /<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml))) out.push(m[1].trim());
  return out;
}

/** Reads the sitemap (one level of index), capped so a 50,000-URL sitemap stays cheap. */
export async function fetchSitemap(origin: string, declared: string[]): Promise<SitemapInfo> {
  const candidates = [...declared, `${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
  for (const candidate of [...new Set(candidates)].slice(0, 4)) {
    try {
      const res = await fetchPolitely(candidate, { timeoutMs: 10000, maxBytes: 4 * 1024 * 1024 });
      if (res.status !== 200 || !/<(urlset|sitemapindex)/i.test(res.body)) continue;
      if (/<sitemapindex/i.test(res.body)) {
        const children = locs(res.body);
        const urls: string[] = [];
        // Page sitemaps first: they hold the service pages we most want to check.
        const ordered = [...children].sort((a, b) => Number(/page/i.test(b)) - Number(/page/i.test(a)));
        for (const child of ordered.slice(0, 4)) {
          try {
            const c = await fetchPolitely(child, { timeoutMs: 10000, maxBytes: 4 * 1024 * 1024 });
            if (c.status === 200) urls.push(...locs(c.body));
          } catch {
            // One unreachable child sitemap does not void the rest.
          }
        }
        return { found: true, url: res.finalUrl, urlCount: urls.length, urls, unreadable: urls.length === 0 };
      }
      const urls = locs(res.body);
      return { found: true, url: res.finalUrl, urlCount: urls.length, urls, unreadable: urls.length === 0 };
    } catch {
      continue;
    }
  }
  return { found: false, url: null, urlCount: 0, urls: [], unreadable: false };
}

/**
 * Pick the extra pages: sitemap URLs on this site first (shallowest paths first, so
 * the main service pages win over deep blog posts), then the homepage's own links.
 */
export function choosePages(home: PageSnapshot, sitemapUrls: string[], limit = MAX_EXTRA_PAGES): string[] {
  const homeUrl = new URL(home.url);
  const seen = new Set<string>([home.url.replace(/\/$/, '')]);
  const pick: string[] = [];
  const depth = (u: string) => new URL(u).pathname.split('/').filter(Boolean).length;
  const add = (u: string) => {
    const c = canonicalPageUrl(u, home.url);
    if (!c) return;
    const parsed = new URL(c);
    if (!sameSite(parsed.hostname, homeUrl.hostname) || SKIP_EXT.test(parsed.pathname)) return;
    const key = c.replace(/\/$/, '');
    if (seen.has(key)) return;
    seen.add(key);
    pick.push(c);
  };

  const fromSitemap = sitemapUrls
    .filter((u) => {
      try {
        return sameSite(new URL(u).hostname, homeUrl.hostname);
      } catch {
        return false;
      }
    })
    .sort((a, b) => depth(a) - depth(b));
  // Half from the sitemap, half from the homepage links, so a stale sitemap
  // cannot hide the pages people actually navigate to.
  for (const u of fromSitemap) {
    if (pick.length >= Math.ceil(limit / 2)) break;
    add(u);
  }
  for (const u of [...home.internalLinks].sort((a, b) => depth(a) - depth(b))) {
    if (pick.length >= limit) break;
    add(u);
  }
  for (const u of fromSitemap) {
    if (pick.length >= limit) break;
    add(u);
  }
  return pick.slice(0, limit);
}

/** Run tasks with a fixed concurrency. Results keep input order. */
export async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}
