import type { Metadata } from 'next';
import InsightsGrid from '@/components/InsightsGrid';
import NewsletterForm from '@/components/forms/NewsletterForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getInsightsIndex } from '@/lib/content';

const posts = getInsightsIndex();

export const metadata: Metadata = {
  title: 'Guides on Websites, SEO and AI Search',
  description:
    'Practical guides on websites, SEO, AI search, and digital marketing for Queensland trades and service businesses.',
  alternates: { canonical: '/insights' },
};

export default function InsightsPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Insights', path: '/insights' }]} />
      <section className="container-wide section-y">
        <h1 className="max-w-[18ch] text-40 md:text-48">
          Insights for Australian businesses.
        </h1>
        <p className="mt-6 max-w-[56ch] text-21 text-muted">
          Practical guides on websites, SEO, AI search, and digital marketing for Queensland
          trades and service businesses.
        </p>
      </section>

      <section className="container-wide pb-16 md:pb-24">
        <InsightsGrid posts={posts} />
      </section>

      <section className="section-deep">
        <div className="container-wide section-y text-center">
          <h2 className="text-28 md:text-40">Get new guides in your inbox.</h2>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
