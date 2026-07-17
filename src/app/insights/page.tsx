import type { Metadata } from 'next';
import InsightsGrid from '@/components/InsightsGrid';
import NewsletterForm from '@/components/forms/NewsletterForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getInsightsIndex } from '@/lib/content';

const posts = getInsightsIndex();

export const metadata: Metadata = {
  title: 'Insights — Web, SEO, and AI Search for Australian Businesses',
  description:
    'Practical guides on websites, SEO, AI search, and digital marketing for Queensland trades and service businesses.',
};

export default function InsightsPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Insights', path: '/insights' }]} />
      <section className="container-wide section-y">
        <h1 className="max-w-[18ch] text-[clamp(2.4rem,5vw,3.6rem)]">
          Insights for Australian businesses.
        </h1>
        <p className="mt-6 max-w-[56ch] text-[1.15rem] text-muted">
          Practical guides on websites, SEO, AI search, and digital marketing for Queensland
          trades and service businesses.
        </p>
      </section>

      <section className="container-wide pb-[60px] md:pb-[120px]">
        <InsightsGrid posts={posts} />
      </section>

      <section className="bg-deep">
        <div className="container-wide section-y text-center">
          <h2 className="text-[clamp(1.6rem,2.8vw,2.2rem)]">Get new guides in your inbox.</h2>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
