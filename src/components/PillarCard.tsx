import Link from 'next/link';
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
  ai: (
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
    <div className="flex flex-col rounded-2xl border border-transparent bg-surface p-9 transition hover:-translate-y-1 hover:border-cyan/40">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#06222a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {icons[pillar.key]}
        </svg>
      </div>
      <h3 className="mb-3 text-2xl">{pillar.heading}</h3>
      <p className="mb-5 text-[0.98rem] text-muted">{pillar.oneLiner}</p>
      <ul className="mb-6 space-y-2">
        {pillar.bullets.map((b) => (
          <li key={b} className="relative pl-6 text-[0.94rem] text-muted">
            <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-cyan" />
            {b}
          </li>
        ))}
      </ul>
      <Link href={pillar.href} className="mt-auto font-body font-semibold text-cyan">
        Explore {pillar.name} →
      </Link>
    </div>
  );
}
