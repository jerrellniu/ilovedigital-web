import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface MdxEntry<T> {
  slug: string;
  frontmatter: T;
  content: string;
}

export function getCollectionSlugs(collection: string): string[] {
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

export function getEntry<T>(collection: string, slug: string): MdxEntry<T> | null {
  const full = path.join(CONTENT_DIR, collection, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, 'utf-8');
  const { data, content } = matter(raw);
  // Strip HTML comments (author notes) so they never render.
  const clean = content.replace(/<!--[\s\S]*?-->/g, '').trim();
  return { slug, frontmatter: data as T, content: clean };
}
