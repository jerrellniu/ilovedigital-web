import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface MdxEntry<T> {
  slug: string;
  frontmatter: T;
  content: string;
}

// Drafts are visible in `npm run dev` so work in progress can be previewed, and
// hidden from production builds so they never get prerendered, linked, or listed
// in sitemap.xml. Publication is opt-in: a file must set `published: true`.
// Anything else — false, missing, malformed — is treated as a draft.
const SHOW_DRAFTS = process.env.NODE_ENV !== 'production';

function isPublished(frontmatter: Record<string, unknown>): boolean {
  return SHOW_DRAFTS || frontmatter.published === true;
}

function readEntry(collection: string, slug: string): MdxEntry<unknown> | null {
  const full = path.join(CONTENT_DIR, collection, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const { data, content } = matter(fs.readFileSync(full, 'utf-8'));
  if (!isPublished(data)) return null;
  // Strip HTML comments (author notes) so they never render.
  const clean = content.replace(/<!--[\s\S]*?-->/g, '').trim();
  return { slug, frontmatter: data, content: clean };
}

export function getCollectionSlugs(collection: string): string[] {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
    .filter((slug) => readEntry(collection, slug) !== null);
}

export function getEntry<T>(collection: string, slug: string): MdxEntry<T> | null {
  return readEntry(collection, slug) as MdxEntry<T> | null;
}
