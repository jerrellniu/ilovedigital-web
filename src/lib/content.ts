import fs from 'node:fs';
import path from 'node:path';
import type {
  SiteContent,
  HomeContent,
  ServicePageContent,
  CaseStudyCardData,
} from '@/types/content';
import { getCollectionSlugs } from './mdx';

const CONTENT_DIR = path.join(process.cwd(), 'content');

function readJson<T>(relativePath: string): T {
  const full = path.join(CONTENT_DIR, relativePath);
  return JSON.parse(fs.readFileSync(full, 'utf-8')) as T;
}

/**
 * Case-study cards are listed in the content files regardless of whether the
 * case study itself has been written yet. `getCollectionSlugs('work')` only
 * returns published slugs (drafts are hidden in production — see mdx.ts), so
 * clear the href on anything else: the card still shows the work, it just
 * doesn't link to a 404. Cards relink themselves as `published: true` is set.
 */
function linkOnlyPublished<T extends CaseStudyCardData>(cards: T[]): T[] {
  const published = new Set(getCollectionSlugs('work').map((slug) => `/work/${slug}`));
  return cards.map((card) =>
    card.href && published.has(card.href) ? card : { ...card, href: undefined }
  );
}

export function getSite(): SiteContent {
  return readJson<SiteContent>('site.json');
}

export function getHome(): HomeContent {
  const home = readJson<HomeContent>('pages/home.json');
  home.featuredWork.cards = linkOnlyPublished(home.featuredWork.cards);
  return home;
}

export function getServicePage(
  slug: 'websites' | 'search' | 'social' | 'ai'
): ServicePageContent {
  const page = readJson<ServicePageContent>(`pages/${slug}.json`);
  if (page.relatedWork) {
    page.relatedWork = linkOnlyPublished([page.relatedWork])[0];
  }
  return page;
}

// Loosely-typed loaders for pages still being finalised (About, Contact, Work,
// Insights). Tighten these into typed shapes as each page is built out.
export function getAbout(): any {
  return readJson('pages/about.json');
}

export function getContact(): any {
  return readJson('pages/contact.json');
}

export function getWorkIndex(): CaseStudyCardData[] {
  return linkOnlyPublished(readJson<CaseStudyCardData[]>('work/index.json'));
}

export function getInsightsIndex(): any[] {
  return readJson('insights/index.json');
}

export function getLegal(slug: 'terms' | 'privacy'): string {
  return fs.readFileSync(path.join(CONTENT_DIR, 'legal', `${slug}.md`), 'utf-8');
}

