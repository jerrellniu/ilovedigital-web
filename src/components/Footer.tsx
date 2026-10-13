import Link from 'next/link';
import Logo from './Logo';
import { ArrowRight, SocialIcon } from './Icons';
import type { SiteContent } from '@/types/content';

// Design system footer: the grey deep ground, 12px text, headings in ink, links in
// muted, and a hairline above the legal strip.
export default function Footer({ site }: { site: SiteContent }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-deep pb-8 pt-16 text-12">
      <div className="container-wide">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" aria-label="I Love Digital — home" className="inline-block">
              <Logo height={24} />
            </Link>
            <p className="mt-4 max-w-[32ch] text-14 text-muted">{site.tagline}</p>
            <p className="mt-4 text-17 font-semibold text-accent">{site.phone}</p>
            {/* Social links as icons: 44px targets, labelled for screen readers. */}
            <ul className="-ml-3 mt-2 flex flex-wrap items-center text-muted">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`I Love Digital on ${s.label}`}
                    title={s.label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-base hover:text-ink"
                  >
                    <SocialIcon label={s.label} />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-semibold text-ink">Got a question?</p>
            <Link href="/contact" className="mt-1 inline-flex items-center gap-1.5 text-accent hover:underline">
              Send us a message
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Link columns */}
          {site.footer.groups.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h5 className="mb-3 font-body text-12 font-semibold text-ink">{group.heading}</h5>
              {group.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block py-1.5 text-muted transition hover:text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-5 text-muted">
          {site.name} · ABN {site.abn} · © {year} All rights reserved
        </div>
      </div>
    </footer>
  );
}
