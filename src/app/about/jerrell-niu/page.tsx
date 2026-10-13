import type { Metadata } from 'next';
import Link from 'next/link';
import Button from '@/components/Button';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import ExperienceMap from '@/components/ExperienceMap';
import { getAuthor, getInsightsIndex, getSite } from '@/lib/content';
import { personSchema, profilePageSchema } from '@/lib/schema';

// The author entity behind every article byline. Article schema references this page's
// Person @id, so the author resolves to a described entity rather than a bare name.
const author = getAuthor();
// The final CTA books a call. The URL lives in site.json with the nav's, so the
// booking link is never written down twice and cannot go stale in one place only.
const site = getSite();

export const metadata: Metadata = {
  title: author.meta.title,
  description: author.meta.description,
  alternates: { canonical: '/about/jerrell-niu' },
};

export default function AuthorPage() {
  const articles = getInsightsIndex().filter((p) => p.href);

  return (
    <>
      <JsonLd
        data={personSchema({
          jobTitle: author.jobTitle,
          description: author.meta.description,
          image: author.image,
          // The four pillars no longer render as a section, but they remain the
          // Person's knowsAbout, which is what ties this entity to its subjects.
          knowsAbout: author.expertise.items.map((i) => i.title),
          sameAs: author.sameAs,
        })}
      />
      <JsonLd data={profilePageSchema(author.name)} />
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
          { name: author.name, path: '/about/jerrell-niu' },
        ]}
      />

      {/* Hero. The experience map carries the portrait at its centre, so there is no separate image. */}
      <section className="container-wide section-y grid items-center gap-12 lg:grid-cols-[1fr_2fr]">
        <div>
          <span className="eyebrow-pill">{author.hero.eyebrow}</span>
          <h1 className="text-40 md:text-48">{author.hero.heading}</h1>
          <p className="mt-3 font-heading text-17 font-semibold text-accent">{author.jobTitle}</p>
          <p className="mt-6 text-21 text-muted">{author.hero.sub}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/contact">Get in touch</Button>
            <Button href="/about" variant="outline">
              About the studio
            </Button>
          </div>
        </div>
        {author.experienceMap ? (
          <ExperienceMap
            data={author.experienceMap}
            portrait={author.image}
            portraitAlt={author.imageAlt}
            name={author.name}
            jobTitle={author.jobTitle}
            showCentreLabel={false}
          />
        ) : null}
      </section>

      {/* Experience */}
      <section className="section-deep">
        <div className="container-wide section-y">
          <h2 className="mb-10 text-28 md:text-40">{author.experience.heading}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {author.experience.items.map((item) => (
              <div key={item.role} className="rounded-card bg-surface p-6">
                <div className="font-heading text-21 font-semibold">{item.role}</div>
                <p className="mt-2 text-17 text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      {articles.length ? (
        <section className="container-wide section-y">
          <h2 className="text-28 md:text-40">{author.articles.heading}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((post) => (
              <Link
                key={post.slug}
                href={post.href as string}
                className="block h-full rounded-card bg-surface p-6 transition hover:shadow-card-hover"
              >
                <span className="text-14 font-semibold text-accent">
                  {post.category}
                </span>
                <h3 className="mt-2 text-21">
                  {post.title}
                </h3>
                <div className="mt-3 text-12 text-muted">{post.readTime} read</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-deep">
        <div className="container-wide section-y text-center">
          <h2 className="mx-auto max-w-[24ch] text-28 md:text-40">
            {author.finalCta.heading}
          </h2>
          <div className="mt-8">
            <Button href={site.booking.href}>{author.finalCta.button.label}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
