import type { Metadata } from 'next';
import FaqAccordion from '@/components/FaqAccordion';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContactForm from '@/components/forms/ContactForm';
import { getContact, getSite } from '@/lib/content';
import { faqPageSchema } from '@/lib/schema';

const contact = getContact();
const site = getSite();

export const metadata: Metadata = {
  title: contact.meta.title,
  description: contact.meta.description,
};

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]} />
      <section className="container-wide section-y">
        <span className="eyebrow">{contact.hero.eyebrow}</span>
        <h1 className="text-[clamp(2.4rem,5vw,3.6rem)]">{contact.hero.heading}</h1>
        <p className="mt-6 max-w-[52ch] text-[1.15rem] text-muted">{contact.hero.sub}</p>
      </section>

      <section className="container-wide grid gap-10 pb-[60px] md:grid-cols-2 md:pb-[120px]">
        {/* Book */}
        <div className="rounded-2xl bg-surface p-8">
          <h2 className="text-[1.4rem]">{contact.book.heading}</h2>
          <p className="mt-3 text-muted">{contact.book.sub}</p>
          {/* TODO: embed Google Calendar appointment schedule */}
          <div className="mt-6 flex h-64 items-center justify-center rounded-xl border border-dashed border-white/15 text-sm text-faint">
            Google Calendar booking embed
          </div>
        </div>

        {/* Message form — TODO: wire to MailerLite */}
        <div className="rounded-2xl bg-surface p-8">
          <h2 className="text-[1.4rem]">{contact.message.heading}</h2>
          <p className="mt-3 text-muted">{contact.message.sub}</p>
          <ContactForm />
        </div>
      </section>

      {/* Direct details */}
      <section className="bg-deep">
        <div className="container-wide section-y">
          <h2 className="text-[1.4rem]">Or reach out directly.</h2>
          <div className="mt-6 grid gap-4 text-muted sm:grid-cols-2">
            <p>Email: <a className="text-cyan" href={`mailto:${site.email}`}>{site.email}</a></p>
            <p>Phone: {site.phone}</p>
            <p>Location: {site.location}</p>
            <p>Social: {site.socials.map((s: { label: string }) => s.label).join(', ')}</p>
          </div>
          <div className="mt-8 rounded-2xl border border-cyan/30 bg-cyan/5 p-6 text-muted">
            {contact.responseCallout}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-wide section-y">
        <h2 className="mb-10 text-center text-[clamp(1.9rem,3.4vw,3rem)]">Frequently asked questions</h2>
        <FaqAccordion items={contact.faq} />
        <JsonLd data={faqPageSchema(contact.faq)} />
      </section>
    </>
  );
}
