import Link from 'next/link';
import { ArrowRight } from './Icons';
import type { Pillar } from '@/types/content';
import type { ReactNode } from 'react';

const icons: Record<Pillar['key'], ReactNode> = {
  websites: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </>
  ),
  social: (
    <>
      <path d="M13 4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2z" />
      <path d="M11 11h7a2 2 0 0 1 2 2v6l-3-2.5h-4a2 2 0 0 1-2-2z" />
    </>
  ),
  // Claude-style sunburst
  consulting: (
    <>
      <line x1="15.6" y1="12" x2="21.4" y2="12" />
      <line x1="15.1" y1="13.8" x2="20.1" y2="16.7" />
      <line x1="13.8" y1="15.1" x2="16.7" y2="20.1" />
      <line x1="12" y1="15.6" x2="12" y2="21.4" />
      <line x1="10.2" y1="15.1" x2="7.3" y2="20.1" />
      <line x1="8.9" y1="13.8" x2="3.9" y2="16.7" />
      <line x1="8.4" y1="12" x2="2.6" y2="12" />
      <line x1="8.9" y1="10.2" x2="3.9" y2="7.3" />
      <line x1="10.2" y1="8.9" x2="7.3" y2="3.9" />
      <line x1="12" y1="8.4" x2="12" y2="2.6" />
      <line x1="13.8" y1="8.9" x2="16.7" y2="3.9" />
      <line x1="15.1" y1="10.2" x2="20.1" y2="7.3" />
    </>
  ),
};

export default function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <div className="group flex flex-col rounded-card bg-surface p-8 transition hover:shadow-card-hover">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan text-on-accent">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {icons[pillar.key]}
        </svg>
      </div>
      <h3 className="mb-2.5 text-21">{pillar.heading}</h3>
      <p className="mb-5 text-17 text-muted">{pillar.oneLiner}</p>
      <ul className="mb-6 space-y-2.5">
        {pillar.bullets.map((b) => (
          <li key={b} className="flex items-start gap-3 text-17 text-muted">
            <span className="mt-0.5 inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <svg className="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Link href={pillar.href} className="mt-auto inline-flex items-center gap-2 font-body text-17 font-semibold text-accent">
        Explore {pillar.name}
        <ArrowRight />
      </Link>
    </div>
  );
}
