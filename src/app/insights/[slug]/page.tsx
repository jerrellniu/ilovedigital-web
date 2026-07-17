import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Button from '@/components/Button';
import Markdown from '@/components/Markdown';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getCollectionSlugs, getEntry } from '@/lib/mdx';
import { getInsightsIndex } from '@/lib/content';
import { articleSchema } from '@/lib/schema';

interface PostFm {
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  author?: string;
  date?: string;
}

export function generateStaticParams() {
  return getCollectionSlugs('insights').map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const entry = getEntry<PostFm>('insights', params.slug);
  if (!entry) return {};
  return { title: entry.frontmatter.title, description: entry.frontmatter.excerpt };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const entry = getEntry<PostFm>('insights', params.slug);
  if (!entry) notFound();
  const fm = entry.frontmatter;
  const related = getInsightsIndex()
    .filter((p) => p.slug !== params.slug && p.category === fm.category)
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: fm.title,
          description: fm.excerpt,
          datePublished: fm.date,
          slug: params.slug,
          section: fm.category,
        })}
      />
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/insights' },
          { name: fm.title, path: `/insights/${params.slug}` },
        ]}
      />

      <article className="container-wide section-y">
        <span className="text-xs font-semibold uppercase tracking-wide text-cyan">{fm.category}</span>
        <h1 className="mt-3 max-w-[26ch] text-[clamp(2.2rem,4.5vw,3.4rem)]">{fm.title}</h1>
        <div className="mt-4 text-[0.9rem] text-faint">
          {fm.author ?? 'Jerrell Niu'}
          {fm.date ? ` · ${fm.date}` : ''} · {fm.readTime} read
        </div>

        <div className="mt-10">
          <Markdown>{entry.content}</Markdown>
        </div>

        {/* Author bio */}
        <div className="mt-14 flex max-w-[70ch] items-center gap-4 rounded-2xl bg-surface p-6">
          <div className="h-14 w-14 shrink-0 rounded-full bg-[linear-gradient(160deg,#2C2F3A,#20222c)]" />
          <div>
            <div className="font-heading font-bold">Jerrell Niu</div>
            <p className="text-[0.9rem] text-muted">
              Founder of I Love Digital.{' '}
              <Link href="/about" className="text-cyan">
                More about me →
              </Link>
            </p>
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="bg-deep">
          <div className="container-wide section-y">
            <h2 className="mb-8 text-[clamp(1.6rem,2.6vw,2.2rem)]">Related reading</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/insights/${p.slug}`}
                  className="block rounded-2xl border border-transparent bg-surface p-6 transition hover:border-cyan/40"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-cyan">
                    {p.category}
                  </span>
                  <h3 className="mt-2 font-heading text-[1.05rem] font-bold leading-snug">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-wide section-y text-center">
        <h2 className="text-[clamp(1.7rem,3vw,2.4rem)]">Want this handled for you?</h2>
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/audit">Get a free website audit</Button>
          <Button href="/contact" variant="outline">Book a discovery call</Button>
        </div>
      </section>
    </>
  );
}
