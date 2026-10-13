'use client';

import { useState } from 'react';
import type { Faq } from '@/types/content';
import { PlusMinusIcon } from './Icons';

// Design system FAQ: one answer open at a time, each row a flat card, with a round
// cyan marker that fills when open.
export default function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question} className="overflow-hidden rounded-card bg-surface">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-heading text-21 font-semibold text-ink"
            >
              {item.question}
              <span
                className={`inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full transition ${
                  isOpen ? 'bg-cyan text-on-accent' : 'bg-accent-soft text-accent'
                }`}
              >
                <PlusMinusIcon open={isOpen} size={16} />
              </span>
            </button>
            <div
              className="grid transition-all duration-slow"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="max-w-[680px] px-6 pb-6 text-17 text-muted">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
