'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import type { SiteContent } from '@/types/content';

export default function Nav({ site }: { site: SiteContent }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-base/80 backdrop-blur">
      <div className="container-wide flex h-[72px] items-center justify-between">
        <Link href="/" aria-label="I Love Digital — home">
          <Logo height={34} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/work" className="text-[15px] font-medium text-muted hover:text-ink">
            Work
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              className="text-[15px] font-medium text-muted hover:text-ink"
              onClick={() => setServicesOpen((v) => !v)}
              aria-expanded={servicesOpen}
            >
              Services
            </button>
            {servicesOpen ? (
              <div className="absolute left-0 top-full w-52 rounded-xl border border-white/10 bg-surface p-2 shadow-xl">
                {site.services.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="block rounded-lg px-3 py-2 text-[15px] text-muted hover:bg-white/5 hover:text-ink"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link href="/about" className="text-[15px] font-medium text-muted hover:text-ink">
            About
          </Link>
          <Link href="/insights" className="text-[15px] font-medium text-muted hover:text-ink">
            Insights
          </Link>
          <Link href="/contact" className="text-[15px] font-medium text-muted hover:text-ink">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            className="hidden rounded-[10px] bg-cyan px-[18px] py-2.5 font-body text-[15px] font-semibold text-[#06222a] hover:brightness-110 md:inline-flex"
          >
            Book a discovery call
          </Link>
          <button
            type="button"
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen ? (
        <div className="border-t border-white/10 px-6 pb-6 pt-2 md:hidden">
          <Link href="/work" className="block py-3 text-muted">Work</Link>
          {site.services.map((s) => (
            <Link key={s.href} href={s.href} className="block py-3 pl-3 text-muted">
              {s.label}
            </Link>
          ))}
          <Link href="/about" className="block py-3 text-muted">About</Link>
          <Link href="/insights" className="block py-3 text-muted">Insights</Link>
          <Link href="/contact" className="block py-3 text-muted">Contact</Link>
          <Link
            href="/contact"
            className="mt-3 inline-flex w-full justify-center rounded-[10px] bg-cyan px-5 py-3 font-semibold text-[#06222a]"
          >
            Book a discovery call
          </Link>
        </div>
      ) : null}
    </header>
  );
}
