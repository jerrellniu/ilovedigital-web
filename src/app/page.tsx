import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/Button';
import HeroSlider from '@/components/HeroSlider';
import { WalletStage, PluginStage, ProofStage } from '@/components/products/HeroVisuals';
import StatsBar from '@/components/StatsBar';
import PartnerMarquee from '@/components/PartnerMarquee';
import SectionHeading from '@/components/SectionHeading';
import PillarCard from '@/components/PillarCard';
import CaseStudyCard from '@/components/CaseStudyCard';
import TestimonialCard from '@/components/TestimonialCard';
import FaqAccordion from '@/components/FaqAccordion';
import CtaBand from '@/components/CtaBand';
import JsonLd from '@/components/JsonLd';
import AuditForm from '@/components/forms/AuditForm';
import { getHome, getSite } from '@/lib/content';
import { faqPageSchema, localBusinessSchema } from '@/lib/schema';

const home = getHome();
const site = getSite();

export const metadata: Metadata = {
  title: home.meta.title,
  description: home.meta.description,
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={localBusinessSchema()} />

      {/* Hero: the eyebrow, then one slide per service and product. Slide 1 holds the H1. */}
      <section>
        <div className="container-wide pb-16 pt-12 md:pb-24 md:pt-16">
          <span className="eyebrow-pill">{home.hero.eyebrow}</span>
          <div className="mt-6">
            <HeroSlider
              label={home.heroSlider.label}
              prevLabel={home.heroSlider.prevLabel}
              nextLabel={home.heroSlider.nextLabel}
              slides={home.heroSlider.slides}
              bookingHref={site.booking.href}
              visuals={{
                ...Object.fromEntries(
                  home.heroSlider.slides
                    .filter((s) => s.showcase)
                    .map((s) => [s.key, <ProofStage key={s.key} showcase={s.showcase!} />])
                ),
                wallet: <WalletStage card={home.products.wallet.card} />,
                plugin: <PluginStage showcase={home.products.plugin.showcase} />,
              }}
            />
          </div>
        </div>
      </section>

      <StatsBar stats={home.stats} />
      <PartnerMarquee partners={site.partners} />

      {/* Pillars */}
      <section className="container-wide section-y">
        <SectionHeading
          eyebrow={home.pillarsIntro.eyebrow}
          heading={home.pillarsIntro.heading}
          sub={home.pillarsIntro.sub}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {home.pillars.map((p) => (
            <PillarCard key={p.key} pillar={p} />
          ))}
        </div>
      </section>

      {/* Featured work */}
      <section className="section-deep">
        <div className="container-wide section-y">
          <SectionHeading
            eyebrow={home.featuredWork.eyebrow}
            heading={home.featuredWork.heading}
            sub={home.featuredWork.sub}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="section-deep">
        <div className="container-wide section-y grid items-center gap-14 md:grid-cols-[0.8fr_1.2fr]">
          {home.founder.image ? (
            // Cut-out portrait anchored to the bottom of a rounded panel, so the
            // shoulder crop meets the panel edge instead of fading out.
            <div className="relative mx-auto aspect-[10/11] w-full max-w-sm overflow-hidden rounded-card bg-surface md:mx-0">
              <Image
                src={home.founder.image}
                alt={home.founder.imageAlt ?? ''}
                width={734}
                height={684}
                sizes="(min-width: 768px) 384px, 100vw"
                className="absolute inset-x-0 bottom-0 w-full"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/5] max-w-xs items-center justify-center rounded-card bg-surface text-14 text-muted">
              Founder portrait
            </div>
          )}
          <div>
            <span className="eyebrow">{home.founder.eyebrow}</span>
            <h2 className="max-w-[20ch] text-28 md:text-40 lg:text-48">{home.founder.heading}</h2>
            {home.founder.paragraphs.map((p, i) => (
              <p key={i} className="mt-5 text-17 text-muted">
                {p}
              </p>
            ))}
            <Link
              href={home.founder.cta.href}
              className="mt-6 inline-flex items-center gap-2 font-body text-17 font-semibold text-accent hover:underline"
            >
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
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {home.process.steps.map((s, i) => (
            <div key={s.title} className="rounded-card bg-surface p-8">
              <div className="font-heading text-40 font-semibold leading-none text-line" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="mb-2.5 mt-5 text-21">{s.title}</h3>
              <p className="text-17 text-muted">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button href={home.process.cta.href} size="lg">
            {home.process.cta.label}
          </Button>
        </div>
      </section>

      {/* Audit CTA */}
      <section id="audit" data-theme="dark" className="section-dark">
        <div className="container-wide section-y flex flex-col items-center text-center">
          <h2 className="max-w-[20ch] text-28 md:text-40 lg:text-48">{home.audit.heading}</h2>
          <p className="mt-4 max-w-[60ch] text-21 text-muted">{home.audit.sub}</p>
          <AuditForm />
          <Link href={home.audit.belowLink.href} className="mt-5 text-17 text-accent hover:underline">
            {home.audit.belowLink.label}
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-wide section-y">
        <h2 className="mb-10 text-center text-28 md:text-40">{home.faq.heading}</h2>
        <FaqAccordion items={home.faq.items} />
        <JsonLd data={faqPageSchema(home.faq.items)} />
      </section>

      {/* Final CTA */}
      <CtaBand heading={home.finalCta.heading} sub={home.finalCta.sub} button={home.finalCta.button} />
    </>
  );
}
