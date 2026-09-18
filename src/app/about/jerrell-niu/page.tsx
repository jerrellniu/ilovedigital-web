import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import ExperienceMap from '@/components/ExperienceMap';
import { getAuthor, getInsightsIndex } from '@/lib/content';
import { personSchema, profilePageSchema } from '@/lib/schema';

// The author entity behind every article byline. Article schema references this page's
// Person @id, so the author resolves to a described entity rather than a bare name.
const author = getAuthor();

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

      {/* Hero */}
      <section className="container-wide section-y grid items-center gap-14 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <span className="eyebrow">{author.hero.eyebrow}</span>
          <h1 className="text-[clamp(2.4rem,5vw,3.6rem)]">{author.hero.heading}</h1>
          <p className="mt-3 font-heading text-[1.05rem] font-bold text-cyan">{author.jobTitle}</p>
          <p className="mt-6 max-w-[46ch] text-[1.15rem] text-muted">{author.hero.sub}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/contact">Get in touch</Button>
            <Button href="/about" variant="outline">
              About the studio
            </Button>
          </div>
        </div>
        {author.image ? (
          <Image
            src={author.image}
            alt={author.imageAlt ?? author.name}
            width={800}
            height={800}
            priority
            className="portrait-fade w-full max-w-sm md:justify-self-end"
          />
        ) : (
          <div className="flex aspect-[4/5] max-w-sm items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(160deg,#2C2F3A,#20222c)] text-sm text-faint md:justify-self-end">
            Photo of {author.name}
          </div>
        )}
      </section>

      {/* Bio */}
      <section className="bg-deep">
        <div className="container-wide section-y">
          <h2 className="max-w-[24ch] text-[clamp(1.7rem,3vw,2.4rem)]">{author.bio.heading}</h2>
          <div className="mt-6 max-w-[70ch] space-y-5 text-[1.05rem] text-muted">
            {author.bio.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          {author.experienceMap ? (
            <div className="mt-12">
              <ExperienceMap
                data={author.experienceMap}
                portrait={author.image}
                portraitAlt={author.imageAlt}
                name={author.name}
                jobTitle={author.jobTitle}
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* Expertise */}
      <section className="container-wide section-y">
        <h2 className="mb-10 text-[clamp(1.7rem,3vw,2.4rem)]">{author.expertise.heading}</h2>
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {author.expertise.items.map((item) => (
            <div key={item.title} className="border-l-2 border-cyan pl-5">
              <div className="font-heading font-bold">{item.title}</div>
              <p className="mt-1 text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="bg-deep">
        <div className="container-wide section-y">
          <h2 className="mb-10 text-[clamp(1.7rem,3vw,2.4rem)]">{author.experience.heading}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {author.experience.items.map((item) => (
              <div key={item.role} className="rounded-2xl bg-surface p-6">
                <div className="font-heading font-bold">{item.role}</div>
                <p className="mt-2 text-[0.95rem] text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      {articles.length ? (
        <section className="container-wide section-y">
          <h2 className="text-[clamp(1.7rem,3vw,2.4rem)]">{author.articles.heading}</h2>
          <p className="mt-4 max-w-[56ch] text-muted">{author.articles.sub}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((post) => (
              <Link
                key={post.slug}
                href={post.href as string}
                className="block rounded-2xl border border-transparent bg-surface p-6 transition hover:-translate-y-1 hover:border-cyan/40"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-cyan">
                  {post.category}
                </span>
                <h3 className="mt-2 font-heading text-[1.05rem] font-bold leading-snug">
                  {post.title}
                </h3>
                <div className="mt-3 text-[0.8rem] text-faint">{post.readTime} read</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-deep">
        <div className="container-wide section-y text-center">
          <h2 className="mx-auto max-w-[24ch] text-[clamp(1.8rem,3.2vw,2.6rem)]">
            {author.finalCta.heading}
          </h2>
          <div className="mt-8">
            <Button href={author.finalCta.button.href}>{author.finalCta.button.label}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
