import type { Metadata } from 'next';
import Button from '@/components/Button';
import FaqAccordion from '@/components/FaqAccordion';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
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
          <span className="eyebrow">{about.hero.eyebrow}</span>
          <h1 className="text-[clamp(2.4rem,5vw,3.6rem)]">{about.hero.heading}</h1>
          <p className="mt-6 max-w-[46ch] text-[1.15rem] text-muted">{about.hero.sub}</p>
        </div>
        <div className="flex aspect-[4/5] max-w-sm items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(160deg,#2C2F3A,#20222c)] text-sm text-faint md:justify-self-end">
          Photo of Jerrell
        </div>
      </section>

      {/* Story */}
      <section className="container-wide pb-[60px] md:pb-[120px]">
        <h2 className="max-w-[24ch] text-[clamp(1.7rem,3vw,2.4rem)]">{about.story.heading}</h2>
        <div className="mt-6 max-w-[70ch] space-y-5 text-[1.05rem] text-muted">
          {about.story.paragraphs.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* What I Bring (inverted) */}
      <section className="bg-deep">
        <div className="container-wide section-y">
          <h2 className="max-w-[24ch] text-[clamp(1.7rem,3vw,2.4rem)]">{about.whatIBring.heading}</h2>
          <div className="mt-6 max-w-[70ch] space-y-5 text-[1.05rem] text-muted">
            {about.whatIBring.paragraphs.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Beliefs */}
      <section className="container-wide section-y">
        <h2 className="mb-10 text-[clamp(1.7rem,3vw,2.4rem)]">{about.beliefs.heading}</h2>
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {about.beliefs.items.map((b: { title: string; body: string }) => (
            <div key={b.title} className="border-l-2 border-cyan pl-5">
              <div className="font-heading font-bold">{b.title}</div>
              <p className="mt-1 text-muted">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section className="bg-deep">
        <div className="container-wide section-y">
          <h2 className="text-[clamp(1.7rem,3vw,2.4rem)]">{about.tech.heading}</h2>
          <p className="mt-3 max-w-[60ch] text-muted">{about.tech.sub}</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {about.tech.groups.map((g: { label: string; items: string[] }) => (
              <div key={g.label} className="rounded-2xl bg-surface p-6">
                <div className="mb-3 text-[0.8rem] uppercase tracking-[0.1em] text-faint">{g.label}</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted">
                  {g.items.map((it) => (
                    <span key={it}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outside work */}
      <section className="container-wide section-y grid items-center gap-14 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-[clamp(1.7rem,3vw,2.4rem)]">{about.outsideWork.heading}</h2>
          <p className="mt-5 max-w-[60ch] text-[1.05rem] text-muted">{about.outsideWork.paragraph}</p>
        </div>
        <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(160deg,#2C2F3A,#20222c)] text-sm text-faint">
          Photo
        </div>
      </section>

      {/* FAQ */}
      <section className="container-wide pb-[60px] md:pb-[120px]">
        <h2 className="mb-10 text-center text-[clamp(1.9rem,3.4vw,3rem)]">Frequently asked questions</h2>
        <FaqAccordion items={about.faq} />
        <JsonLd data={faqPageSchema(about.faq)} />
      </section>

      {/* Final CTA */}
      <section className="bg-deep">
        <div className="container-wide section-y text-center">
          <h2 className="text-[clamp(1.9rem,3.4vw,2.8rem)]">{about.finalCta.heading}</h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[1.1rem] text-muted">{about.finalCta.sub}</p>
          <div className="mt-8">
            <Button href={about.finalCta.button.href}>{about.finalCta.button.label}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
