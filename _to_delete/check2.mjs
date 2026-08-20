import fs from 'node:fs';
import matter from 'gray-matter';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const pub = new Set();
for (const f of fs.readdirSync('content/work').filter(f => f.endsWith('.mdx'))) {
  const slug = f.replace(/\.mdx$/, '');
  const { data, content } = matter(fs.readFileSync('content/work/' + f, 'utf8'));
  if (data.published === true) {
    pub.add(slug);
    const clean = content.replace(/<!--[\s\S]*?-->/g, '').trim();
    const html = renderToStaticMarkup(React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, clean));
    console.log('PUBLISHED', slug.padEnd(20), 'html=' + html.length, 'leak=' + /<!--/.test(html));
  }
}
const idx = JSON.parse(fs.readFileSync('content/work/index.json', 'utf8'));
const home = JSON.parse(fs.readFileSync('content/pages/home.json', 'utf8'));
console.log('\nhub cards linking:', idx.filter(c => pub.has(c.href.split('/').pop())).length, 'of', idx.length);
for (const c of home.featuredWork.cards) {
  const slug = c.href.split('/').pop();
  const m = idx.find(i => i.href === c.href);
  console.log('home card', slug.padEnd(20), 'published=' + pub.has(slug), 'matchesHub=' + (m && m.headline === c.headline && m.outcome === c.outcome));
}
for (const c of idx) {
  const slug = c.href.split('/').pop();
  if (!fs.existsSync('content/work/' + slug + '.mdx')) console.log('MISSING MDX', slug);
  if (!fs.existsSync('public' + c.image)) console.log('MISSING IMAGE', c.image);
}
