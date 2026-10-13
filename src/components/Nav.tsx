'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import type { SiteContent } from '@/types/content';

// Design system nav: sticky, 44px tall (48px on phones), translucent with a frosted
// blur and no border or shadow. 12px links, small pill CTA on the right.
export default function Nav({ site }: { site: SiteContent }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 [-webkit-backdrop-filter:saturate(180%)_blur(20px)] [backdrop-filter:saturate(180%)_blur(20px)]"
      style={{ background: 'var(--nav-bg)' }}
    >
      <div className="container-wide flex h-12 items-center justify-between gap-6 md:h-nav">
        <Link href="/" aria-label="I Love Digital — home" className="shrink-0">
          <Logo height={20} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 text-12 text-muted transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={site.booking.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-cyan px-4 py-1.5 text-14 text-on-accent transition hover:bg-cyan-hover active:scale-[0.97] md:inline-flex"
          >
            {site.booking.label}
          </a>
          <button
            type="button"
            className="-mr-2 p-2 text-ink md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6 6 18" />
              ) : (
                <>
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen ? (
        <div className="border-t border-line px-5 pb-6 pt-2 md:hidden">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-3 text-21 font-semibold text-ink"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={site.booking.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full justify-center rounded-full bg-cyan px-5 py-3 text-17 text-on-accent"
          >
            {site.booking.label}
          </a>
        </div>
      ) : null}
    </header>
  );
}
