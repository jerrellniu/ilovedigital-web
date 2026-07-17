import { readFileSync } from 'node:fs';

// 301 redirect map (old Squarespace URLs -> new). Populate redirects.json at cutover
// from the Content & Structure Audit URL table.
const redirects = JSON.parse(
  readFileSync(new URL('./redirects.json', import.meta.url), 'utf-8')
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return redirects;
  },
};

export default nextConfig;
