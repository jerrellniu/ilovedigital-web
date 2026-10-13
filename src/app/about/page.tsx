import type { Metadata } from 'next';
import Image from 'next/image';
import Button from '@/components/Button';
import FaqAccordion from '@/components/FaqAccordion';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import LogoMarquee from '@/components/LogoMarquee';
import { getAbout } from '@/lib/content';
import { faqPageSchema } from '@/lib/schema';

const about = getAbout();

export const metadata: Metadata = {
  title: about.meta.title,
  description: about.meta.description,
};

export default function AboutPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />
      {/* Hero */}
      <section className="container-wide section-y grid items-center gap-14 md:grid-cols-2">
        <div>
          <span className="eyebrow-pill">{about.hero.eyebrow}</span>
          <h1 className="text-40 md:text-48">{about.hero.heading}</h1>
          <p className="mt-6 max-w-[46ch] text-21 text-muted">{about.hero.sub}</p>
        </div>
        {about.hero.image ? (
          <Image
            src={about.hero.image}
            alt={about.hero.imageAlt ?? ''}
            width={800}
            height={800}
            priority
            className="portrait-fade w-full max-w-sm md:justify-self-end"
          />
        ) : (
          <div className="flex aspect-[4/5] max-w-sm items-center justify-center rounded-card bg-surface text-14 text-muted md:justify-self-end">
            Photo of Jerrell
          </div>
        )}
      </section>

      {/* Story */}
      <section className="container-wide pb-16 md:pb-24">
        <h2 className="max-w-[24ch] text-28 md:text-40">{about.story.heading}</h2>
        <div className="mt-6 max-w-[70ch] space-y-5 text-17 text-muted">
          {about.story.paragraphs.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* What I Bring (inverted) */}
      <section className="section-deep">
        <div className="container-wide section-y">
          <h2 className="max-w-[24ch] text-28 md:text-40">{about.whatIBring.heading}</h2>
          <div className="mt-6 max-w-[70ch] space-y-5 text-17 text-muted">
            {about.whatIBring.paragraphs.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Beliefs */}
      <section className="container-wide section-y">
        <h2 className="mb-10 text-28 md:text-40">{about.beliefs.heading}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {about.beliefs.items.map((b: { title: string; body: string }) => (
            <div key={b.title} className="rounded-card bg-surface p-6">
              <h3 className="text-21">{b.title}</h3>
              <p className="mt-2 text-17 text-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section className="section-deep">
        <div className="container-wide section-y">
          <h2 className="text-28 md:text-40">{about.tech.heading}</h2>
          <div className="mt-10">
            <LogoMarquee />
          </div>
        </div>
      </section>

      {/* Outside work */}
      <section className="container-wide section-y grid items-center gap-14 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-28 md:text-40">{about.outsideWork.heading}</h2>
          <p className="mt-5 max-w-[60ch] text-17 text-muted">{about.outsideWork.paragraph}</p>
        </div>
        <div className="flex aspect-[4/3] items-center justify-center rounded-card bg-surface text-14 text-muted">
          Photo
        </div>
      </section>

      {/* FAQ */}
      <section className="container-wide pb-16 md:pb-24">
        <h2 className="mb-10 text-center text-28 md:text-40">Frequently asked questions</h2>
        <FaqAccordion items={about.faq} />
        <JsonLd data={faqPageSchema(about.faq)} />
      </section>

      {/* Final CTA */}
      <section className="section-deep">
        <div className="container-wide section-y text-center">
          <h2 className="text-28 md:text-40">{about.finalCta.heading}</h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-21 text-muted">{about.finalCta.sub}</p>
          <div className="mt-8">
            <Button href={about.finalCta.button.href}>{about.finalCta.button.label}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
