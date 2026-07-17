import Button from './Button';
import type { HeroBlock } from '@/types/content';

export default function Hero({ hero }: { hero: HeroBlock }) {
  return (
    <section className="container-wide section-y">
      {hero.eyebrow ? <span className="eyebrow">{hero.eyebrow}</span> : null}
      <h1 className="max-w-[18ch] text-[clamp(2.4rem,5vw,3.6rem)]">{hero.heading}</h1>
      <p className="mt-6 max-w-[56ch] text-[1.15rem] text-muted">{hero.sub}</p>
      {hero.primaryCta || hero.secondaryCta ? (
        <div className="mt-8 flex flex-wrap items-center gap-5">
          {hero.primaryCta ? (
            <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
          ) : null}
          {hero.secondaryCta ? (
            <a href={hero.secondaryCta.href} className="font-body font-semibold text-cyan">
              {hero.secondaryCta.label}
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
