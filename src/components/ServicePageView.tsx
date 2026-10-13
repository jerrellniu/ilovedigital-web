import Link from 'next/link';
import Hero from './Hero';
import Checklist from './Checklist';
import CaseStudyCard from './CaseStudyCard';
import FaqAccordion from './FaqAccordion';
import CtaBand from './CtaBand';
import JsonLd from './JsonLd';
import { faqPageSchema } from '@/lib/schema';
import type { ServicePageContent } from '@/types/content';

export default function ServicePageView({ content }: { content: ServicePageContent }) {
  return (
    <>
      <Hero hero={content.hero} />

      <section className="container-wide pb-[60px] md:pb-[120px]">
        <h2 className="mb-8 text-28 md:text-40">{content.included.heading}</h2>
        <Checklist items={content.included.items} />

        {content.platforms ? (
          <div className="mt-10 border-t border-line pt-6">
            <span className="text-14 font-semibold text-ink">
              {content.platforms.label}
            </span>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-muted">
              {content.platforms.items.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>
          </div>
        ) : null}

        {content.note ? <p className="mt-8 max-w-[60ch] text-muted">{content.note}</p> : null}

        {content.howItWorks ? (
          <div className="mt-8 rounded-card bg-surface p-6 text-17 text-muted">
            {content.howItWorks}
          </div>
        ) : null}
      </section>

      {content.relatedWork?.length ? (
        <section className="section-deep">
          <div className="container-wide section-y">
            <h2 className="mb-8 text-28 md:text-40">Related work</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {content.relatedWork.map((c, i) => (
                <CaseStudyCard key={`${c.href ?? c.client}-${i}`} data={c} />
              ))}
            </div>
          </div>
        </section>
      ) : content.relatedWorkNote ? (
        <section className="section-deep">
          <div className="container-wide section-y">
            <p className="text-muted">{content.relatedWorkNote}</p>
          </div>
        </section>
      ) : null}

      {content.guides?.length ? (
        <section className="container-wide section-y">
          <h2 className="mb-8 text-28 md:text-40">Guides</h2>
          <ul className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {content.guides.map((g) => (
              <li key={g.slug}>
                <Link href={g.href ?? `/insights/${g.slug}`} className="font-heading text-21 font-semibold text-ink transition hover:text-accent">
                  {g.title}
                </Link>
                <p className="mt-1 text-17 text-muted">{g.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="container-wide section-y">
        <h2 className="mb-10 text-center text-28 md:text-40">
          Frequently asked questions
        </h2>
        <FaqAccordion items={content.faq} />
        <JsonLd data={faqPageSchema(content.faq)} />
      </section>

      <CtaBand heading={content.ctaBand.heading} button={content.ctaBand.button} />
    </>
  );
}
