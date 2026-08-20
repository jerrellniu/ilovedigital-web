import fs from 'node:fs';
import matter from 'gray-matter';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const files = ['solar-set','evolved-solar','gc-connected-homes','butchers-pride','trigahex'];
for (const slug of files) {
  const raw = fs.readFileSync(`content/work/${slug}.mdx`, 'utf8');
  const { data, content } = matter(raw);
  const clean = content.replace(/<!--[\s\S]*?-->/g, '').trim();
  const html = renderToStaticMarkup(React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, clean));
  const req = ['client','tag','headline','outcome','image','slug','published'];
  const missing = req.filter(k => data[k] === undefined);
  console.log(slug.padEnd(20), 'html=' + html.length, 'h2=' + (html.match(/<h2>/g)||[]).length, 'comment-leak=' + /<!--/.test(html), 'missingFm=' + (missing.join(',')||'none'));
}
