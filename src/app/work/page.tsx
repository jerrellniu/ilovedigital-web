import type { Metadata } from 'next';
import Button from '@/components/Button';
import WorkGrid from '@/components/WorkGrid';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getSite, getWorkIndex } from '@/lib/content';

const items = getWorkIndex();
const site = getSite();

export const metadata: Metadata = {
  title: 'Our Work — Case Studies in Web, Search, Socials, and Consulting',
  description:
    "Case studies from Queensland trades and service businesses we've helped with websites, SEO, social media, and brand identity.",
};

export default function WorkPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Work', path: '/work' }]} />
      <section className="container-wide section-y">
        <h1 className="max-w-[18ch] text-36 md:text-48">
          Real work. Real Queensland businesses.
        </h1>
        <p className="mt-6 max-w-[56ch] text-20 text-muted">
          Case studies from Queensland trades and service businesses we&apos;ve helped with
          websites, SEO, social media, and brand identity.
        </p>
      </section>

      <section className="container-wide pb-[60px] md:pb-[120px]">
        <WorkGrid items={items} />
      </section>

      <section className="bg-deep">
        <div className="container-wide section-y text-center">
          <h2 className="text-28 md:text-36">Your business could be here next.</h2>
          <div className="mt-8">
            <Button href={site.booking.href}>{site.booking.label}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
