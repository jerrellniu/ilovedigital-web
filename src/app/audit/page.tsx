import type { Metadata } from 'next';
import AuditForm from '@/components/forms/AuditForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import BookingEmbed from '@/components/BookingEmbed';
import { getSite } from '@/lib/content';

const site = getSite();

export const metadata: Metadata = {
  title: 'Free Website Audit and 3-Month Plan',
  description:
    'Get a free website audit in about a minute: technical SEO, on-page SEO, speed and AI search readiness, with the fixes in priority order.',
  alternates: { canonical: '/audit' },
};

const whatYouGet = [
  { title: 'Scores in four areas', body: 'See how your site rates for technical SEO, on-page SEO, speed and AI search readiness.' },
  { title: 'Fixes in priority order', body: 'Every issue comes with a plain-English fix, and the most urgent sits at the top.' },
  { title: '3-month action plan', body: 'A staged plan you can act on, with or without us.' },
];

const steps = [
  { n: 1, title: 'Enter your URL', body: 'Add your website and email. It takes 30 seconds.' },
  { n: 2, title: 'We audit', body: 'We check your key pages, your links, your speed and your AI search setup.' },
  { n: 3, title: 'You receive', body: 'Your report appears on screen in about a minute, and a copy lands in your inbox.' },
];

export default function AuditPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Free website audit', path: '/audit' }]} />
      <section className="container-wide section-y">
        <h1 className="max-w-[16ch] text-40 md:text-48">Free website audit. No catch.</h1>
        <p className="mt-6 max-w-[56ch] text-21 text-muted">
          Enter your URL and get your report in about a minute. We check your technical SEO,
          on-page SEO, speed and AI search readiness, then give you the fixes in order and a
          3-month plan. A copy lands in your inbox too. No obligation.
        </p>
        <AuditForm full />
      </section>

      <section className="section-deep">
        <div className="container-wide section-y">
          <h2 className="mb-10 text-center text-28 md:text-40">What you get</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {whatYouGet.map((c) => (
              <div key={c.title} className="rounded-card bg-surface p-8">
                <h3 className="text-21">{c.title}</h3>
                <p className="mt-3 text-muted">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wide section-y">
        <h2 className="mb-10 text-center text-28 md:text-40">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-card bg-surface p-8">
              <div className="font-heading text-40 font-semibold leading-none text-line" aria-hidden="true">
                {String(s.n).padStart(2, '0')}
              </div>
              <h3 className="mb-2.5 mt-5 text-21">{s.title}</h3>
              <p className="text-17 text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking. Second path for anyone who would rather talk it through with a person. */}
      <section className="section-deep">
        <div className="container-wide section-y">
          <h2 className="text-28 md:text-40">Rather talk it through?</h2>
          <p className="mt-4 max-w-[52ch] text-muted">
            Grab 15 minutes and we&apos;ll go over your site together. No pitch, no obligation.
          </p>
          <div className="mx-auto max-w-[820px]">
            <BookingEmbed
              src={site.schedules.discovery15.embedUrl}
              fallbackHref={site.schedules.discovery15.href}
              title={site.schedules.discovery15.label}
            />
          </div>
        </div>
      </section>
    </>
  );
}
