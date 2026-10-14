// Google PageSpeed Insights (Lighthouse + Chrome UX Report field data).
//
// PAGESPEED_API_KEY is strongly recommended: without a key Google's shared quota is
// usually exhausted and the call returns 429, which we report as "not checked"
// rather than guessing. Free key: Google Cloud console -> APIs -> PageSpeed Insights API.
//
// The PageSpeed endpoint is a fixed Google host, so it is called with fetch() and
// does not need the SSRF guard. The audited URL is only passed as a parameter.

import type { SpeedResult } from './types';

const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

interface LhAudit {
  displayValue?: string;
}
interface PsiResponse {
  lighthouseResult?: {
    categories?: Record<string, { score: number | null }>;
    audits?: Record<string, LhAudit>;
  };
  loadingExperience?: {
    overall_category?: string;
    metrics?: Record<string, { percentile?: number }>;
  };
  error?: { message?: string };
}

const pct = (v: number | null | undefined) => (typeof v === 'number' ? Math.round(v * 100) : null);

export async function pagespeed(url: string, strategy: 'mobile' | 'desktop', timeoutMs = 75000): Promise<SpeedResult> {
  const params = new URLSearchParams({ url, strategy });
  for (const c of ['performance', 'accessibility', 'best-practices', 'seo']) params.append('category', c);
  if (process.env.PAGESPEED_API_KEY) params.set('key', process.env.PAGESPEED_API_KEY);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${ENDPOINT}?${params}`, { signal: ctrl.signal, cache: 'no-store' });
    const data = (await res.json()) as PsiResponse;
    if (!res.ok || !data.lighthouseResult) {
      throw new Error(data.error?.message || `PageSpeed returned ${res.status}`);
    }
    const cats = data.lighthouseResult.categories || {};
    const audits = data.lighthouseResult.audits || {};
    const field = data.loadingExperience?.metrics || {};
    const fieldCls = field.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile;
    return {
      strategy,
      performance: pct(cats.performance?.score),
      accessibility: pct(cats.accessibility?.score),
      bestPractices: pct(cats['best-practices']?.score),
      seo: pct(cats.seo?.score),
      lcp: audits['largest-contentful-paint']?.displayValue ?? null,
      cls: audits['cumulative-layout-shift']?.displayValue ?? null,
      tbt: audits['total-blocking-time']?.displayValue ?? null,
      fcp: audits['first-contentful-paint']?.displayValue ?? null,
      fieldLcpMs: field.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null,
      fieldInpMs: field.INTERACTION_TO_NEXT_PAINT?.percentile ?? null,
      // CrUX reports CLS multiplied by 100.
      fieldCls: typeof fieldCls === 'number' ? fieldCls / 100 : null,
      fieldCategory: data.loadingExperience?.overall_category ?? null,
    };
  } finally {
    clearTimeout(timer);
  }
}
