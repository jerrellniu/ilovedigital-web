'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { InsightCardData } from '@/lib/content';

// Same four labels as the /work filters and the pillar pages: one taxonomy across the site.
const FILTERS = ['All', 'Web', 'Search', 'Socials', 'Consulting'] as const;

// Design system card: flat surface, hover adds the soft card shadow.
const SHELL = 'group flex h-full flex-col overflow-hidden rounded-card bg-surface';
const INTERACTIVE = 'transition hover:shadow-card-hover';
const TINT = 'bg-[linear-gradient(135deg,rgba(192,132,252,0.28),rgba(28,191,212,0.28))]';

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
            className="object-cover transition-transform duration-slow group-hover:scale-[1.04]"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-14 font-semibold text-accent">{post.category}</span>
        <h3 className="mt-1.5 text-21">{post.title}</h3>
        <p className="mt-2 text-17 text-muted">{post.excerpt}</p>
        <div className="mt-auto pt-4 text-14 text-muted">
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
            aria-pressed={filter === f}
            className={`chip ${filter === f ? 'chip-active' : ''}`}
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
