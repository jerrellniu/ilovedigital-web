import { readFileSync, existsSync } from 'node:fs';
import matter from 'gray-matter';

// 301 redirect map (old Squarespace URLs -> new), built from the live Squarespace
// sitemap at cutover. See the Content & Structure Audit URL table in Notion.
const raw = JSON.parse(
  readFileSync(new URL('./redirects.json', import.meta.url), 'utf-8')
);

// A 301 that lands on a page we have not published yet is worse than no redirect
// at all: the old URL's ranking is passed straight into a 404. Detail-page targets
// are resolved against the MDX on disk using the same rule as src/lib/mdx.ts —
// drafts are visible in dev and hidden in production — and anything unavailable
// falls back to its hub. Nothing to remember at launch: set `published: true` and
// the redirect starts pointing at the real page on the next build.
const showDrafts = process.env.NODE_ENV !== 'production';

const isAvailable = (destination) => {
  const match = destination.match(/^\/(work|insights)\/(.+)$/);
  if (!match) return true;
  const [, collection, slug] = match;
  const file = new URL(`./content/${collection}/${slug}.mdx`, import.meta.url);
  if (!existsSync(file)) return false;
  if (showDrafts) return true;
  return matter(readFileSync(file, 'utf-8')).data.published === true;
};

const unavailable = [];
const redirects = raw.map((redirect) => {
  if (isAvailable(redirect.destination)) return redirect;
  const hub = `/${redirect.destination.split('/')[1]}`;
  unavailable.push(`${redirect.source} -> ${redirect.destination} (sending to ${hub})`);
  return { ...redirect, destination: hub };
});

if (unavailable.length > 0) {
  console.warn(
    `\n[redirects] ${unavailable.length} redirect(s) target a page that is not published yet:\n` +
      unavailable.map((line) => `  ${line}`).join('\n') +
      '\n'
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return redirects;
  },
};

export default nextConfig;
