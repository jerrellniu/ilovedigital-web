'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Post {
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  slug: string;
}

const FILTERS = ['All', 'Web', 'SEO', 'Brand', 'Tools'] as const;

export default function InsightsGrid({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState<string>('All');
  const visible = posts.filter((p) => filter === 'All' || p.category === filter);

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              filter === f
                ? 'border-cyan bg-cyan text-[#06222a]'
                : 'border-white/15 text-muted hover:border-cyan hover:text-ink'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <Link
            key={p.slug}
            href={`/insights/${p.slug}`}
            className="group block overflow-hidden rounded-2xl border border-transparent bg-surface transition hover:-translate-y-1 hover:border-cyan/40"
          >
            <div className="aspect-[16/10] bg-[linear-gradient(135deg,rgba(28,191,212,0.18),rgba(192,132,252,0.18)),#20222c]" />
            <div className="p-6">
              <span className="text-xs font-semibold uppercase tracking-wide text-cyan">
                {p.category}
              </span>
              <h3 className="mt-2 font-heading text-[1.15rem] font-bold leading-snug">{p.title}</h3>
              <p className="mt-2 text-[0.92rem] text-muted">{p.excerpt}</p>
              <div className="mt-3 text-[0.8rem] text-faint">{p.readTime} read</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
