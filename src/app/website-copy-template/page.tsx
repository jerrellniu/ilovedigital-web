import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import Checklist from '@/components/Checklist';
import FaqAccordion from '@/components/FaqAccordion';
import CtaBand from '@/components/CtaBand';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import TemplateForm from '@/components/forms/TemplateForm';
import { getCopyTemplatePage } from '@/lib/content';
import { faqPageSchema } from '@/lib/schema';

const content = getCopyTemplatePage();

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  alternates: { canonical: '/website-copy-template' },
};

export default function WebsiteCopyTemplatePage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Website copy template', path: '/website-copy-template' },
        ]}
      />
      <Hero hero={content.hero} />

      <section className="container-wide pb-[60px] md:pb-[120px]">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="mb-8 text-28 md:text-40">{content.included.heading}</h2>
            <Checklist items={content.included.items} />
          </div>
          <div id="get-template" className="rounded-card bg-surface p-8">
            <h2 className="text-28">{content.form.heading}</h2>
            <p className="mb-6 mt-3 text-17 text-muted">{content.form.body}</p>
            <TemplateForm copy={content.form} />
          </div>
        </div>
      </section>

      <section className="container-wide section-y">
        <h2 className="mb-10 text-center text-28 md:text-40">Frequently asked questions</h2>
        <FaqAccordion items={content.faq} />
        <JsonLd data={faqPageSchema(content.faq)} />
      </section>

      <CtaBand heading={content.ctaBand.heading} button={content.ctaBand.button} />
    </>
  );
}
