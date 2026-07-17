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
        <h2 className="mb-8 text-[clamp(1.6rem,2.6vw,2.2rem)]">{content.included.heading}</h2>
        <Checklist items={content.included.items} />

        {content.platforms ? (
          <div className="mt-10 border-t border-white/10 pt-6">
            <span className="text-[0.8rem] uppercase tracking-[0.1em] text-faint">
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
          <div className="mt-8 rounded-2xl border border-white/10 bg-surface/60 p-6 text-[0.96rem] text-muted">
            {content.howItWorks}
          </div>
        ) : null}
      </section>

      {content.relatedWork ? (
        <section className="bg-deep">
          <div className="container-wide section-y">
            <h2 className="mb-8 text-[clamp(1.6rem,2.6vw,2.2rem)]">Related work</h2>
            <div className="max-w-md">
              <CaseStudyCard data={content.relatedWork} />
            </div>
          </div>
        </section>
      ) : content.relatedWorkNote ? (
        <section className="bg-deep">
          <div className="container-wide section-y">
            <p className="text-faint">{content.relatedWorkNote}</p>
          </div>
        </section>
      ) : null}

      <section className="container-wide section-y">
        <h2 className="mb-10 text-center text-[clamp(1.9rem,3.4vw,3rem)]">
          Frequently asked questions
        </h2>
        <FaqAccordion items={content.faq} />
        <JsonLd data={faqPageSchema(content.faq)} />
      </section>

      <CtaBand heading={content.ctaBand.heading} button={content.ctaBand.button} />
    </>
  );
}
