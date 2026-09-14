import type { Faq } from '@/types/content';

export const SITE_URL = 'https://ilovedigital.com.au';

/**
 * The author entity. Article `author` is a reference to this @id, and the author page
 * at /about/jerrell-niu emits the Person node itself, so search engines and AI crawlers
 * resolve the byline to one described entity instead of a bare name string.
 */
export const AUTHOR_PATH = '/about/jerrell-niu';
export const AUTHOR_URL = `${SITE_URL}${AUTHOR_PATH}`;
export const AUTHOR_ID = `${AUTHOR_URL}#person`;
export const AUTHOR_NAME = 'Jerrell Niu';

// JSON-LD builders. GEO/AI-citation requires FAQPage schema on every page that has
// an FAQ, plus page-type schema (LocalBusiness, Article, etc.). Render the returned
// object inside a <script type="application/ld+json"> tag.

export function faqPageSchema(items: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'I Love Digital',
    url: 'https://ilovedigital.com.au',
    telephone: '1300 944 890',
    email: 'jerrell@ilovedigital.com.au',
    areaServed: 'Queensland, Australia',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'QLD',
      addressCountry: 'AU',
      addressLocality: 'Gold Coast',
    },
  };
}

export function articleSchema(a: {
  title: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  slug: string;
  section?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    articleSection: a.section,
    author: { '@type': 'Person', '@id': AUTHOR_ID, name: AUTHOR_NAME, url: AUTHOR_URL },
    publisher: { '@type': 'Organization', name: 'I Love Digital', url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/insights/${a.slug}`,
  };
}

/**
 * The Person node for the author page. Every fact here is carried by the page copy —
 * nothing is asserted in schema that a reader cannot see on the page.
 */
export function personSchema(p: {
  jobTitle: string;
  description: string;
  image?: string;
  knowsAbout: string[];
  sameAs: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: AUTHOR_NAME,
    url: AUTHOR_URL,
    jobTitle: p.jobTitle,
    description: p.description,
    image: p.image ? `${SITE_URL}${p.image}` : undefined,
    knowsAbout: p.knowsAbout,
    sameAs: p.sameAs,
    worksFor: {
      '@type': 'Organization',
      name: 'I Love Digital',
      url: SITE_URL,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gold Coast',
      addressRegion: 'QLD',
      addressCountry: 'AU',
    },
  };
}

/** ProfilePage wrapper so the author page itself is typed, with the Person as its subject. */
export function profilePageSchema(name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: AUTHOR_URL,
    mainEntity: { '@id': AUTHOR_ID, '@type': 'Person', name },
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path}`,
    })),
  };
}

// JsonLd render component lives in src/components/JsonLd.tsx (JSX must be in a .tsx file).
