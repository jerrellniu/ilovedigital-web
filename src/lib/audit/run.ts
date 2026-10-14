// The audit agent: fetch, crawl, check, measure speed, interpret.
//
// Budget: the route allows 120 seconds. PageSpeed is the slow part (20 to 60
// seconds per strategy), so it starts first and runs alongside the crawl. Every
// step that can fail is caught and recorded in notChecked, so one unreachable
// sitemap or a PageSpeed quota error never sinks the whole report.

import { randomUUID } from 'node:crypto';
import * as cheerio from 'cheerio';
import { safeFetch, normaliseInputUrl, BlockedUrlError } from './safe-fetch';
import { choosePages, fetchPolitely, fetchRobots, fetchSitemap, parsePage, pool, sameSite } from './crawl';
import { pagespeed } from './pagespeed';
import { buildFindings, score, type Collected } from './checks';
import { interpret } from './interpret';
import type { AuditEvent, AuditReport, PageSnapshot, ProgressStep, SpeedResult } from './types';

export class AuditInputError extends Error {}

const MAX_LINK_CHECKS = 40;
const AU_PHONE = /(\+?61[\s-]?[2-478]|\(0[2-478]\)|0[2-478])[\s-]?\d{4}[\s-]?\d{4}|\b1[38]00[\s-]?\d{3}[\s-]?\d{3}\b|\b13[\s-]?\d{2}[\s-]?\d{2}\b|\b04\d{2}[\s-]?\d{3}[\s-]?\d{3}\b/;

export interface RunOptions {
  url: string;
  business?: string | null;
  concern?: string | null;
  onEvent?: (e: AuditEvent) => void;
  /** Skip PageSpeed, for local runs without a key. */
  skipSpeed?: boolean;
}

export async function runAudit(opts: RunOptions): Promise<AuditReport> {
  const emit = (step: ProgressStep, label: string) => opts.onEvent?.({ type: 'progress', step, label });
  const notChecked: string[] = [];

  let input: URL;
  try {
    input = normaliseInputUrl(opts.url);
  } catch (e) {
    throw new AuditInputError(e instanceof BlockedUrlError ? `We can't audit that address: ${e.message}.` : 'That does not look like a website address.');
  }

  emit('fetch', `Loading ${input.hostname}`);
  let home;
  try {
    home = await safeFetch(input, { timeoutMs: 15000 });
  } catch (e) {
    if (e instanceof BlockedUrlError) throw new AuditInputError(`We can't audit that address: ${e.message}.`);
    throw new AuditInputError(`We couldn't reach ${input.hostname}. Check the address is right and the site is live, then try again.`);
  }
  if (home.status >= 400) {
    throw new AuditInputError(`${input.hostname} returned an error (${home.status}) when we loaded it. Check the address and try again.`);
  }
  if (!/html/i.test(home.headers['content-type'] || 'text/html')) {
    throw new AuditInputError(`${input.hostname} did not return a web page.`);
  }

  const final = new URL(home.finalUrl);
  const origin = final.origin;

  // Start PageSpeed now; it runs while we crawl.
  const speedPromise: Promise<SpeedResult[]> = opts.skipSpeed
    ? Promise.resolve([])
    : Promise.allSettled([pagespeed(home.finalUrl, 'mobile'), pagespeed(home.finalUrl, 'desktop')]).then((results) => {
        const ok = results.filter((r): r is PromiseFulfilledResult<SpeedResult> => r.status === 'fulfilled').map((r) => r.value);
        results.forEach((r) => r.status === 'rejected' && console.warn('[audit] PageSpeed failed:', r.reason?.message || r.reason));
        return ok;
      });

  emit('crawl', 'Reading your robots.txt, sitemap and pages');
  const homePage = parsePage(home);

  const [robots, httpCheck, llms] = await Promise.all([
    fetchRobots(origin),
    final.protocol === 'https:'
      ? safeFetch(`http://${final.host}/`, { timeoutMs: 8000, maxRedirects: 3, method: 'HEAD' })
          .then((r) => r.finalUrl.startsWith('https:'))
          .catch(() => null)
      : Promise.resolve(false),
    safeFetch(`${origin}/llms.txt`, { timeoutMs: 6000, maxBytes: 256 * 1024 })
      .then((r) => r.status === 200 && !/text\/html/i.test(r.headers['content-type'] || '') && r.body.trim().length > 0)
      .catch(() => false),
  ]);
  const sitemap = await fetchSitemap(origin, robots.sitemaps);

  const extra = choosePages(homePage, sitemap.urls);
  const pages: PageSnapshot[] = [homePage];
  const crawled = await pool(extra, 3, async (u) => {
    try {
      const r = await fetchPolitely(u, { timeoutMs: 10000 });
      if (!sameSite(new URL(r.finalUrl).hostname, final.hostname)) return null;
      if (!/html/i.test(r.headers['content-type'] || 'text/html')) return null;
      return parsePage(r);
    } catch {
      return { ...emptyPage(u), status: 0 };
    }
  });
  for (const p of crawled) if (p) pages.push(p);

  emit('technical', `Checking ${pages.length} pages and their links`);
  const crawledUrls = new Set(pages.map((p) => p.url.replace(/\/$/, '')));
  const linkTargets = [...new Set(pages.flatMap((p) => p.internalLinks))]
    .filter((u) => !crawledUrls.has(u.replace(/\/$/, '')))
    .slice(0, MAX_LINK_CHECKS);
  const linkResults = await pool(linkTargets, 3, async (u) => {
    try {
      let r = await fetchPolitely(u, { method: 'HEAD', timeoutMs: 8000 });
      // Some servers refuse HEAD; confirm with a small GET before calling it broken.
      if (r.status === 405 || r.status === 403 || r.status === 501 || r.status === 404) {
        r = await fetchPolitely(u, { timeoutMs: 8000, maxBytes: 64 * 1024 });
      }
      return { url: u, status: r.status };
    } catch {
      return { url: u, status: 0 };
    }
  });
  // Only a clear "not here" counts as broken. 401/403 are login pages or firewalls,
  // and 429, 5xx or no answer after a retry mean we could not tell, not that the
  // link is dead. Those are reported as unverified, never as broken.
  const isBroken = (s: number) => s >= 400 && s < 500 && s !== 401 && s !== 403 && s !== 429;
  const brokenLinks = linkResults.filter((r) => isBroken(r.status));
  const unverifiedLinks = linkResults.filter((r) => !isBroken(r.status) && (r.status === 0 || r.status === 429 || r.status >= 500)).length;

  const $ = cheerio.load(home.body);
  const hasTel = $('a[href^="tel:"]').length > 0;
  const bodyText = $('body').text();
  const hasPhone = hasTel || AU_PHONE.test(bodyText);
  const hasEmail = $('a[href^="mailto:"]').length > 0;
  const linkPaths = homePage.internalLinks.map((u) => new URL(u).pathname.toLowerCase());
  const hasAboutLink = linkPaths.some((p) => /about|our-story|who-we-are|team/.test(p));
  const hasContactLink = linkPaths.some((p) => /contact/.test(p));

  emit('speed', 'Measuring speed with Google PageSpeed');
  const speed = await speedPromise;
  if (!opts.skipSpeed && speed.length === 0) {
    notChecked.push('Page speed: Google PageSpeed was unavailable for this run, so speed scores are not included. You can test it yourself at pagespeed.web.dev.');
  } else if (opts.skipSpeed) {
    notChecked.push('Page speed was not measured on this run.');
  }

  emit('geo', 'Checking AI search readiness');
  const collected: Collected = {
    homeUrl: input.toString(),
    finalUrl: home.finalUrl,
    homeStatus: home.status,
    homeMs: home.ms,
    redirectHops: home.chain.length - 1,
    hsts: Boolean(home.headers['strict-transport-security']),
    httpRedirectsToHttps: httpCheck,
    robots,
    sitemap,
    llmsTxt: llms,
    pages,
    brokenLinks,
    linksChecked: linkResults.length - unverifiedLinks,
    unverifiedLinks,
    speed,
    hasPhone,
    hasEmail,
    hasAboutLink,
    hasContactLink,
  };
  const findings = buildFindings(collected);
  const { scores, overall } = score(findings);

  notChecked.push(
    'Google Business Profile, reviews and backlinks need account access or paid data, so they are covered in a full audit rather than this instant one.',
  );

  emit('interpret', 'Writing your priorities and three-month plan');
  const interpretation = await interpret({
    findings,
    scores,
    overall,
    pagesChecked: pages.length,
    host: final.hostname,
    business: opts.business ?? null,
    concern: opts.concern ?? null,
  });

  const report: AuditReport = {
    id: randomUUID(),
    url: input.toString(),
    finalUrl: home.finalUrl,
    host: final.hostname,
    business: opts.business ?? null,
    createdAt: new Date().toISOString(),
    pagesChecked: pages.map((p) => p.url),
    scores,
    overall,
    findings,
    speed,
    interpretation,
    notChecked,
  };
  emit('done', 'Your report is ready');
  return report;
}

function emptyPage(url: string): PageSnapshot {
  return {
    url,
    status: 0,
    title: null,
    description: null,
    h1: [],
    canonical: null,
    noindex: false,
    lang: null,
    viewport: true,
    wordCount: 0,
    imagesTotal: 0,
    imagesMissingAlt: 0,
    schemaTypes: [],
    ogTitle: false,
    ogImage: false,
    internalLinks: [],
    mixedContent: 0,
    ms: 0,
  };
}
