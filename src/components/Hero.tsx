import Button from './Button';
import type { HeroBlock } from '@/types/content';

// Design system hero: eyebrow pill, large headline, intro copy, primary and outline pills.
export default function Hero({ hero }: { hero: HeroBlock }) {
  return (
    <section className="container-wide section-y">
      {hero.eyebrow ? <span className="eyebrow-pill">{hero.eyebrow}</span> : null}
      <h1 className="max-w-[18ch] text-40 md:text-48 lg:text-64">{hero.heading}</h1>
      <p className="mt-6 max-w-[56ch] text-21 text-muted">{hero.sub}</p>
      {hero.primaryCta || hero.secondaryCta ? (
        <div className="mt-8 flex flex-wrap items-center gap-3.5">
          {hero.primaryCta ? (
            <Button href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
            </Button>
          ) : null}
          {hero.secondaryCta ? (
            <Button href={hero.secondaryCta.href} size="lg" variant="outline">
              {hero.secondaryCta.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
