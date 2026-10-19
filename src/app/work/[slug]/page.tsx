import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Button from '@/components/Button';
import Markdown from '@/components/Markdown';
import ReviewQuote, { type Review } from '@/components/ReviewQuote';
import CaseStudyCard from '@/components/CaseStudyCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getCollectionSlugs, getEntry } from '@/lib/mdx';
import { getSite, getWorkIndex } from '@/lib/content';

const site = getSite();

interface CaseFm {
  client: string;
  tag: string;
  industry?: string;
  services?: string[];
  timeline?: string;
  headline: string;
  outcome: string;
  /** Build platform. Renders as a neutral pill beside the tag; omitted when absent. */
  platform?: string;
  /** 16:10 hero screenshot under public/. Section is omitted when absent. */
  image?: string;
  /** Alt text for `image`. Defaults to "<client> website". */
  imageAlt?: string;
  /** Verbatim client review, rendered above the body. Section omitted when absent. */
  review?: Review;
}

export function generateStaticParams() {
  return getCollectionSlugs('work').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry<CaseFm>('work', slug);
  if (!entry) return {};
  // Headline plus outcome reads as a full search snippet; fall back to the outcome alone
  // when the pair runs past the 155 characters Google shows.
  const { headline, outcome } = entry.frontmatter;
  const combined = `${headline}. ${outcome}`;
  return {
    title: `${entry.frontmatter.client} — ${entry.frontmatter.tag} Case Study`,
    description: combined.length <= 155 ? combined : outcome,
    alternates: { canonical: `/work/${slug}` },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry<CaseFm>('work', slug);
  if (!entry) notFound();
  const fm = entry.frontmatter;
  const related = getWorkIndex()
    .filter((c) => c.href !== `/work/${slug}`)
    .slice(0, 2);

  const glance: [string, string][] = [
    ['Client', fm.client],
    ['Industry', fm.industry ?? '—'],
    ['Services', (fm.services ?? []).join(', ') || '—'],
    ['Timeline', fm.timeline ?? '—'],
  ];

  return (
    <>
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
          { name: fm.client, path: `/work/${slug}` },
        ]}
      />
      <section className="container-wide section-y">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent-soft px-3 py-1.5 text-14 font-semibold text-accent">
            {fm.tag}
          </span>
          {fm.platform ? (
            <span className="rounded-full bg-accent-soft px-3 py-1.5 text-14 font-semibold text-accent">
              {fm.platform}
            </span>
          ) : null}
        </div>
        <h1 className="mt-5 max-w-[22ch] text-40 md:text-48">{fm.headline}</h1>
        <p className="mt-5 max-w-[52ch] text-21 text-muted">{fm.outcome}</p>
      </section>

      {fm.image ? (
        <section className="container-wide pb-12">
          <Image
            src={fm.image}
            alt={fm.imageAlt ?? `${fm.client} website`}
            width={1200}
            height={750}
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="w-full rounded-card"
          />
        </section>
      ) : null}

      <section className="container-wide pb-12">
        <div className="grid gap-6 rounded-card bg-surface p-8 sm:grid-cols-2 lg:grid-cols-4">
          {glance.map(([k, v]) => (
            <div key={k}>
              <div className="text-14 text-muted">{k}</div>
              <div className="mt-1 text-ink">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {fm.review ? (
        <section className="container-wide pb-12">
          <ReviewQuote review={fm.review} />
        </section>
      ) : null}

      <section className="container-wide pb-16 md:pb-24">
        <Markdown>{entry.content}</Markdown>
      </section>

      {related.length ? (
        <section className="section-deep">
          <div className="container-wide section-y">
            <h2 className="mb-8 text-28 md:text-40">Related work</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((c, i) => (
                <CaseStudyCard key={`${c.href}-${i}`} data={c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-wide section-y text-center">
        <h2 className="text-28 md:text-40">Want results like this?</h2>
        <div className="mt-8">
          <Button href={site.booking.href}>{site.booking.label}</Button>
        </div>
      </section>
    </>
  );
}
