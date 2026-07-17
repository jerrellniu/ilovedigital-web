import type { Metadata } from 'next';
import AuditForm from '@/components/forms/AuditForm';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Free Website Audit — Loom Walkthrough + PDF Report',
  description:
    'Get a free technical website audit. A 5-minute Loom walkthrough and a PDF report with prioritised recommendations, urgent fixes, and a 3-month plan.',
};

const whatYouGet = [
  { title: '5-minute Loom', body: 'A recorded walkthrough of your site and the issues that matter most.' },
  { title: 'Written PDF report', body: 'Technical findings, prioritised recommendations, and urgent fixes.' },
  { title: '3-month action plan', body: 'A clear, staged plan you can act on — with or without us.' },
];

const steps = [
  { n: 1, title: 'Submit your URL', body: 'Tell us your website and email. Takes 30 seconds.' },
  { n: 2, title: 'We audit', body: 'We review your site against our full checklist.' },
  { n: 3, title: 'You receive', body: 'Your Loom and PDF land within 3 business days.' },
];

export default function AuditPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Free website audit', path: '/audit' }]} />
      <section className="container-wide section-y">
        <h1 className="max-w-[16ch] text-[clamp(2.4rem,5vw,3.6rem)]">Free website audit. No catch.</h1>
        <p className="mt-6 max-w-[56ch] text-[1.15rem] text-muted">
          Send us your URL. Within 3 business days you&apos;ll get back a 5-minute Loom walkthrough
          and a written PDF report covering technical issues, urgent fixes, and a 3-month action
          plan. No obligation.
        </p>
        <AuditForm full />
      </section>

      <section className="bg-deep">
        <div className="container-wide section-y">
          <h2 className="mb-10 text-center text-[clamp(1.7rem,3vw,2.4rem)]">What you get</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {whatYouGet.map((c) => (
              <div key={c.title} className="rounded-2xl bg-surface p-8">
                <h3 className="font-heading text-xl">{c.title}</h3>
                <p className="mt-3 text-muted">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wide section-y">
        <h2 className="mb-10 text-center text-[clamp(1.7rem,3vw,2.4rem)]">How it works</h2>
        <div className="grid gap-7 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-cyan font-heading font-bold text-cyan">
                {s.n}
              </div>
              <h4 className="mb-2.5 font-heading text-[1.15rem]">{s.title}</h4>
              <p className="text-[0.94rem] text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
