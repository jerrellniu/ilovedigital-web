import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Button from '@/components/Button';
import Markdown from '@/components/Markdown';
import CaseStudyCard from '@/components/CaseStudyCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getCollectionSlugs, getEntry } from '@/lib/mdx';
import { getWorkIndex } from '@/lib/content';

interface CaseFm {
  client: string;
  tag: string;
  industry?: string;
  services?: string[];
  timeline?: string;
  headline: string;
  outcome: string;
  /** 16:10 hero screenshot under public/. Section is omitted when absent. */
  image?: string;
}

export function generateStaticParams() {
  return getCollectionSlugs('work').map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const entry = getEntry<CaseFm>('work', params.slug);
  if (!entry) return {};
  return {
    title: `${entry.frontmatter.client} — ${entry.frontmatter.tag} Case Study`,
    description: entry.frontmatter.outcome,
  };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const entry = getEntry<CaseFm>('work', params.slug);
  if (!entry) notFound();
  const fm = entry.frontmatter;
  const related = getWorkIndex()
    .filter((c) => c.href !== `/work/${params.slug}`)
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
          { name: fm.client, path: `/work/${params.slug}` },
        ]}
      />
      <section className="container-wide section-y">
        <span className="rounded-full border border-cyan/40 px-3 py-1.5 text-xs font-semibold text-cyan">
          {fm.tag}
        </span>
        <h1 className="mt-5 max-w-[22ch] text-[clamp(2.2rem,4.5vw,3.4rem)]">{fm.headline}</h1>
        <p className="mt-5 max-w-[52ch] text-[1.15rem] text-muted">{fm.outcome}</p>
      </section>

      {fm.image ? (
        <section className="container-wide pb-12">
          <Image
            src={fm.image}
            alt={`${fm.client} website`}
            width={1200}
            height={750}
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="w-full rounded-2xl"
          />
        </section>
      ) : null}

      <section className="container-wide pb-12">
        <div className="grid gap-6 rounded-2xl bg-surface p-8 sm:grid-cols-2 lg:grid-cols-4">
          {glance.map(([k, v]) => (
            <div key={k}>
              <div className="text-[0.8rem] uppercase tracking-[0.1em] text-faint">{k}</div>
              <div className="mt-1 text-ink">{v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-wide pb-[60px] md:pb-[120px]">
        <Markdown>{entry.content}</Markdown>
      </section>

      {related.length ? (
        <section className="bg-deep">
          <div className="container-wide section-y">
            <h2 className="mb-8 text-[clamp(1.6rem,2.6vw,2.2rem)]">Related work</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((c, i) => (
                <CaseStudyCard key={`${c.href}-${i}`} data={c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-wide section-y text-center">
        <h2 className="text-[clamp(1.7rem,3vw,2.4rem)]">Want results like this?</h2>
        <div className="mt-8">
          <Button href="/contact">Book a discovery call</Button>
        </div>
      </section>
    </>
  );
}
