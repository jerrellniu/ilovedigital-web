import type { Metadata } from 'next';
import Link from 'next/link';
import Button from '@/components/Button';
import StatsBar from '@/components/StatsBar';
import SectionHeading from '@/components/SectionHeading';
import PillarCard from '@/components/PillarCard';
import CaseStudyCard from '@/components/CaseStudyCard';
import TestimonialCard from '@/components/TestimonialCard';
import FaqAccordion from '@/components/FaqAccordion';
import JsonLd from '@/components/JsonLd';
import AuditForm from '@/components/forms/AuditForm';
import { getHome } from '@/lib/content';
import { faqPageSchema, localBusinessSchema } from '@/lib/schema';

const home = getHome();

export const metadata: Metadata = {
  title: home.meta.title,
  description: home.meta.description,
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={localBusinessSchema()} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(28,191,212,0.16),transparent_62%)] blur-2xl" />
        <div className="pointer-events-none absolute -left-20 bottom-[-30%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(192,132,252,0.12),transparent_62%)] blur-2xl" />
        <div className="container-wide relative section-y">
          <span className="eyebrow">{home.hero.eyebrow}</span>
          <h1 className="max-w-[16ch] text-[clamp(2.6rem,5.6vw,4.25rem)]">
            We make <span className="text-cyan">websites</span>, and{' '}
            <span className="text-purple">Google</span> simple.
          </h1>
          <p className="mt-6 max-w-[56ch] text-[1.2rem] text-muted">{home.hero.sub}</p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Button href={home.hero.primaryCta!.href}>{home.hero.primaryCta!.label}</Button>
            <a href={home.hero.secondaryCta!.href} className="font-body font-semibold text-cyan">
              {home.hero.secondaryCta!.label}
            </a>
          </div>
        </div>
      </section>

      <StatsBar stats={home.stats} />

      {/* Pillars */}
      <section className="container-wide section-y">
        <SectionHeading
          eyebrow={home.pillarsIntro.eyebrow}
          heading={home.pillarsIntro.heading}
          sub={home.pillarsIntro.sub}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {home.pillars.map((p) => (
            <PillarCard key={p.key} pillar={p} />
          ))}
        </div>
      </section>

      {/* Featured work */}
      <section className="bg-deep">
        <div className="container-wide section-y">
          <SectionHeading
            eyebrow={home.featuredWork.eyebrow}
            heading={home.featuredWork.heading}
            sub={home.featuredWork.sub}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {home.featuredWork.cards.map((c, i) => (
              <CaseStudyCard key={`${c.href ?? c.client}-${i}`} data={c} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button href={home.featuredWork.footerCta.href} variant="outline">
              {home.featuredWork.footerCta.label}
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-wide section-y">
        <SectionHeading heading={home.testimonials.heading} sub={home.testimonials.sub} />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {home.testimonials.items.map((t) => (
            <TestimonialCard key={t.author} item={t} />
          ))}
        </div>
      </section>

      {/* Founder */}
      <section className="bg-deep">
        <div className="container-wide section-y grid items-center gap-14 md:grid-cols-[0.8fr_1.2fr]">
          <div className="flex aspect-[4/5] max-w-xs items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(160deg,#2C2F3A,#20222c)] text-sm text-faint">
            Founder portrait
          </div>
          <div>
            <span className="eyebrow">{home.founder.eyebrow}</span>
            <h2 className="max-w-[20ch] text-[clamp(1.9rem,3.4vw,3rem)]">{home.founder.heading}</h2>
            {home.founder.paragraphs.map((p, i) => (
              <p key={i} className="mt-5 text-[1.05rem] text-muted">
                {p}
              </p>
            ))}
            <Link href={home.founder.cta.href} className="mt-6 inline-block font-body font-semibold text-cyan">
              {home.founder.cta.label}
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container-wide section-y">
        <SectionHeading
          eyebrow={home.process.eyebrow}
          heading={home.process.heading}
          sub={home.process.sub}
        />
        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {home.process.steps.map((s, i) => (
            <div key={s.title}>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-cyan font-heading font-bold text-cyan">
                {i + 1}
              </div>
              <h4 className="mb-2.5 font-heading text-[1.15rem]">{s.title}</h4>
              <p className="text-[0.94rem] text-muted">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button href={home.process.cta.href}>{home.process.cta.label}</Button>
        </div>
      </section>

      {/* Audit CTA */}
      <section id="audit" className="border-y border-white/10 bg-[linear-gradient(120deg,#181521,#1b1830)]">
        <div className="container-wide section-y flex flex-col items-center text-center">
          <h2 className="text-[clamp(1.9rem,3.4vw,3rem)]">{home.audit.heading}</h2>
          <p className="mt-4 max-w-[60ch] text-muted">{home.audit.sub}</p>
          <AuditForm />
          <Link href={home.audit.belowLink.href} className="mt-5 text-[0.9rem] font-semibold text-cyan">
            {home.audit.belowLink.label}
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-wide section-y">
        <h2 className="mb-10 text-center text-[clamp(1.9rem,3.4vw,3rem)]">{home.faq.heading}</h2>
        <FaqAccordion items={home.faq.items} />
        <JsonLd data={faqPageSchema(home.faq.items)} />
      </section>

      {/* Final CTA */}
      <section className="bg-[radial-gradient(circle_at_50%_0%,rgba(28,191,212,0.12),transparent_60%)]">
        <div className="container-wide section-y text-center">
          <h2 className="text-[clamp(2rem,4vw,3.2rem)]">{home.finalCta.heading}</h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[1.1rem] text-muted">{home.finalCta.sub}</p>
          <div className="mt-8">
            <Button href={home.finalCta.button.href}>{home.finalCta.button.label}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
