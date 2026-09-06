'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { InsightCardData } from '@/lib/content';

// Same four labels as the /work filters and the pillar pages: one taxonomy across the site.
const FILTERS = ['All', 'Web', 'Search', 'Socials', 'Consulting'] as const;

const SHELL = 'group block overflow-hidden rounded-2xl border border-transparent bg-surface';
const INTERACTIVE = 'transition hover:-translate-y-1 hover:border-cyan/40';
const TINT =
  'bg-[linear-gradient(135deg,rgba(28,191,212,0.18),rgba(192,132,252,0.18)),#20222c]';

function Card({ post }: { post: InsightCardData }) {
  const body = (
    <>
      <div className={`relative aspect-[16/10] overflow-hidden ${TINT}`}>
        {post.image ? (
          <Image
            src={post.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="p-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-cyan">{post.category}</span>
        <h3 className="mt-2 font-heading text-[1.15rem] font-bold leading-snug">{post.title}</h3>
        <p className="mt-2 text-[0.92rem] text-muted">{post.excerpt}</p>
        <div className="mt-3 text-[0.8rem] text-faint">
          {post.href ? `${post.readTime} read` : 'Coming soon'}
        </div>
      </div>
    </>
  );

  // An unpublished post renders as a card with nothing to click, never as a link to a 404.
  return post.href ? (
    <Link href={post.href} className={`${SHELL} ${INTERACTIVE}`}>
      {body}
    </Link>
  ) : (
    <div className={`${SHELL} opacity-80`}>{body}</div>
  );
}

export default function InsightsGrid({ posts }: { posts: InsightCardData[] }) {
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
          <Card key={p.slug} post={p} />
        ))}
      </div>
    </>
  );
}
