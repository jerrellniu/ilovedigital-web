import fs from 'node:fs';
import path from 'node:path';
import type { SiteContent, HomeContent, ServicePageContent } from '@/types/content';

const CONTENT_DIR = path.join(process.cwd(), 'content');

function readJson<T>(relativePath: string): T {
  const full = path.join(CONTENT_DIR, relativePath);
  return JSON.parse(fs.readFileSync(full, 'utf-8')) as T;
}

export function getSite(): SiteContent {
  return readJson<SiteContent>('site.json');
}

export function getHome(): HomeContent {
  return readJson<HomeContent>('pages/home.json');
}

export function getServicePage(
  slug: 'websites' | 'search' | 'social' | 'ai'
): ServicePageContent {
  return readJson<ServicePageContent>(`pages/${slug}.json`);
}

// Loosely-typed loaders for pages still being finalised (About, Contact, Work,
// Insights). Tighten these into typed shapes as each page is built out.
export function getAbout(): any {
  return readJson('pages/about.json');
}

export function getContact(): any {
  return readJson('pages/contact.json');
}

export function getWorkIndex(): any[] {
  return readJson('work/index.json');
}

export function getInsightsIndex(): any[] {
  return readJson('insights/index.json');
}

export function getLegal(slug: 'terms' | 'privacy'): string {
  return fs.readFileSync(path.join(CONTENT_DIR, 'legal', `${slug}.md`), 'utf-8');
}

