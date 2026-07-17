'use client';

import { useState } from 'react';
import CaseStudyCard from './CaseStudyCard';
import type { CaseStudyCardData } from '@/types/content';

const FILTERS = ['All', 'Web', 'Search', 'Social', 'AI'] as const;

function matches(tag: string, filter: string) {
  if (filter === 'All') return true;
  const t = tag.toLowerCase();
  if (filter === 'Search') return t.includes('seo') || t.includes('search') || t.includes('geo');
  return t.includes(filter.toLowerCase());
}

export default function WorkGrid({ items }: { items: CaseStudyCardData[] }) {
  const [filter, setFilter] = useState<string>('All');
  const visible = items.filter((i) => matches(i.tag, filter));

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
        {visible.map((c, i) => (
          <CaseStudyCard key={`${c.href}-${i}`} data={c} />
        ))}
      </div>
    </>
  );
}
