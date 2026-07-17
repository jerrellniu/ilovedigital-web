import type { Metadata } from 'next';
import Button from '@/components/Button';
import WorkGrid from '@/components/WorkGrid';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getWorkIndex } from '@/lib/content';

const items = getWorkIndex();

export const metadata: Metadata = {
  title: 'Our Work — Case Studies in Web, SEO, Social, and Brand',
  description:
    "Case studies from Queensland trades and service businesses we've helped with websites, SEO, social media, and brand identity.",
};

export default function WorkPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Work', path: '/work' }]} />
      <section className="container-wide section-y">
        <h1 className="max-w-[18ch] text-[clamp(2.4rem,5vw,3.6rem)]">
          Real work. Real Queensland businesses.
        </h1>
        <p className="mt-6 max-w-[56ch] text-[1.15rem] text-muted">
          Case studies from Queensland trades and service businesses we&apos;ve helped with
          websites, SEO, social media, and brand identity.
        </p>
      </section>

      <section className="container-wide pb-[60px] md:pb-[120px]">
        <WorkGrid items={items} />
      </section>

      <section className="bg-deep">
        <div className="container-wide section-y text-center">
          <h2 className="text-[clamp(1.8rem,3.2vw,2.6rem)]">Your business could be here next.</h2>
          <div className="mt-8">
            <Button href="/contact">Book a discovery call</Button>
          </div>
        </div>
      </section>
    </>
  );
}
