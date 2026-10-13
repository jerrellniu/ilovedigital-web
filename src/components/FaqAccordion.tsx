'use client';

import { useState } from 'react';
import type { Faq } from '@/types/content';
import { PlusMinusIcon } from './Icons';

export default function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-[820px]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question} className="border-b border-white/10">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-6 text-left font-heading text-20 font-semibold"
            >
              {item.question}
              <PlusMinusIcon open={isOpen} className="shrink-0 text-cyan" />
            </button>
            <div
              className="grid transition-all duration-slow"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="pb-6 text-muted">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
