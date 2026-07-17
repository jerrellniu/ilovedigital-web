import type { MetadataRoute } from 'next';
import { getCollectionSlugs } from '@/lib/mdx';

const BASE = 'https://ilovedigital.com.au';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/websites',
    '/search',
    '/social',
    '/ai',
    '/work',
    '/about',
    '/insights',
    '/contact',
    '/audit',
    '/terms',
    '/privacy',
  ];

  const work = getCollectionSlugs('work').map((s) => `/work/${s}`);
  const insights = getCollectionSlugs('insights').map((s) => `/insights/${s}`);

  return [...routes, ...work, ...insights].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
