import type { Faq } from '@/types/content';

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
  slug: string;
  section?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    datePublished: a.datePublished,
    articleSection: a.section,
    author: { '@type': 'Person', name: 'Jerrell Niu' },
    publisher: { '@type': 'Organization', name: 'I Love Digital' },
    mainEntityOfPage: `https://ilovedigital.com.au/insights/${a.slug}`,
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
      item: `https://ilovedigital.com.au${t.path}`,
    })),
  };
}

// JsonLd render component lives in src/components/JsonLd.tsx (JSX must be in a .tsx file).
