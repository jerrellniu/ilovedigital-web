import Link from 'next/link';
import Logo from './Logo';
import type { SiteContent } from '@/types/content';

export default function Footer({ site }: { site: SiteContent }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-deep pb-9 pt-16">
      <div className="container-wide">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" aria-label="I Love Digital — home" className="inline-block">
              <Logo height={40} />
            </Link>
            <p className="mt-4 max-w-[32ch] text-[0.92rem] text-muted">{site.tagline}</p>
            <p className="mt-4 text-[0.92rem] text-muted">{site.phone}</p>
            <div className="mt-3 flex gap-3 text-faint">
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} className="hover:text-cyan" aria-label={s.label}>
                  {s.label}
                </a>
              ))}
            </div>
            <p className="mt-4 text-[0.85rem] uppercase tracking-wide text-faint">Got a question?</p>
            <Link href="/contact" className="text-[0.92rem] font-semibold text-cyan">
              Send us a message →
            </Link>
          </div>

          {/* Link columns */}
          {site.footer.groups.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h5 className="mb-4 font-body text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-faint">
                {group.heading}
              </h5>
              {group.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block py-1.5 text-[0.94rem] text-muted hover:text-cyan"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-[0.85rem] text-faint">
          {site.name} · ABN {site.abn} · © {year} All rights reserved
        </div>
      </div>
    </footer>
  );
}
