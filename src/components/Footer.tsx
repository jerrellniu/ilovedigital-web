import Link from 'next/link';
import Logo from './Logo';
import type { SiteContent } from '@/types/content';

export default function Footer({ site }: { site: SiteContent }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-deep pb-9 pt-16">
      <div className="container-wide">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
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

          {/* Useful links */}
          <div>
            <h5 className="mb-4 font-body text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-faint">
              Useful links
            </h5>
            {site.footer.usefulLinks.map((l) => (
              <Link key={l.label} href={l.href} className="block py-1.5 text-[0.94rem] text-muted hover:text-cyan">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Resources */}
          <div>
            <h5 className="mb-4 font-body text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-faint">
              Resources
            </h5>
            {site.footer.resources.map((l) => (
              <Link key={l.label} href={l.href} className="block py-1.5 text-[0.94rem] text-muted hover:text-cyan">
                {l.label}
              </Link>
            ))}
            {site.footer.resourcesNote ? (
              <p className="mt-3 text-[0.75rem] text-faint">{site.footer.resourcesNote}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-[0.85rem] text-faint">
          <span>
            {site.name} · ABN {site.abn} · © {year} All rights reserved
          </span>
          <span className="flex gap-4">
            {site.legal.map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-cyan">
                {l.label}
              </Link>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
