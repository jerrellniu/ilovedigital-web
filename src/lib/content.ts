import fs from 'node:fs';
import path from 'node:path';
import type {
  SiteContent,
  HomeContent,
  ServicePageContent,
  CaseStudyCardData,
  AuthorPageContent,
  HeroBlock,
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

/**
 * A hero heading is written twice: once flat for metadata and schema, once split into
 * runs so its accent colours are content rather than markup. They have to say the same
 * thing, so fail the build loudly rather than ship a page whose H1 and its <title>
 * disagree.
 */
function assertHeadingPartsMatch(hero: HeroBlock, where: string): void {
  if (!hero.headingParts) return;
  const joined = hero.headingParts.map((p) => p.text).join('');
  if (joined !== hero.heading) {
    throw new Error(
      `${where}: hero.headingParts join to ${JSON.stringify(joined)}, ` +
        `which is not hero.heading ${JSON.stringify(hero.heading)}`
    );
  }
}

export function getSite(): SiteContent {
  return readJson<SiteContent>('site.json');
}

export function getHome(): HomeContent {
  const home = readJson<HomeContent>('pages/home.json');
  assertHeadingPartsMatch(home.hero, 'content/pages/home.json');
  home.featuredWork.cards = linkOnlyPublished(home.featuredWork.cards);
  return home;
}

export function getServicePage(
  slug: 'websites' | 'search' | 'social' | 'consulting'
): ServicePageContent {
  const page = readJson<ServicePageContent>(`pages/${slug}.json`);
  if (page.relatedWorkTag) {
    // A card tagged "Web + Search" belongs on both pillar pages, so match on the
    // parts rather than the whole string.
    const wanted = page.relatedWorkTag.toLowerCase();
    page.relatedWork = getWorkIndex()
      .filter((c) =>
        c.tag
          .split('+')
          .map((t) => t.trim().toLowerCase())
          .includes(wanted)
      )
      // Published first. An unpublished card renders unlinked, so filling the row
      // with those would put three client names on the page with nothing to click.
      .sort((a, b) => Number(Boolean(b.href)) - Number(Boolean(a.href)))
      // Three keeps the row to one line on desktop. The rest are on /work.
      .slice(0, 3);
  }
  return page;
}

// Loosely-typed loaders for pages still being finalised (About, Contact, Work,
// Insights). Tighten these into typed shapes as each page is built out.
export function getAbout(): any {
  return readJson('pages/about.json');
}

export function getAuthor(): AuthorPageContent {
  return readJson<AuthorPageContent>('pages/author.json');
}

export function getContact(): any {
  return readJson('pages/contact.json');
}

export function getWorkIndex(): CaseStudyCardData[] {
  return linkOnlyPublished(readJson<CaseStudyCardData[]>('work/index.json'));
}

export interface InsightCardData {
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  slug: string;
  /** Set only when the MDX file is published; an unpublished post renders as an unlinked card. */
  href?: string;
  /** Resolved by convention from public/images/insights/<slug>.jpg — drop the file in and the slot switches on. */
  image?: string;
}

export function getInsightsIndex(): InsightCardData[] {
  const published = new Set(getCollectionSlugs('insights'));
  const posts = readJson<InsightCardData[]>('insights/index.json');
  return posts.map((post) => {
    const thumb = path.join(process.cwd(), 'public', 'images', 'insights', `${post.slug}.jpg`);
    return {
      ...post,
      href: published.has(post.slug) ? `/insights/${post.slug}` : undefined,
      image: fs.existsSync(thumb) ? `/images/insights/${post.slug}.jpg` : undefined,
    };
  });
}

export function getLegal(slug: 'terms' | 'privacy'): string {
  return fs.readFileSync(path.join(CONTENT_DIR, 'legal', `${slug}.md`), 'utf-8');
}

