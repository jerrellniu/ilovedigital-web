import Button from './Button';
import type { HeroBlock } from '@/types/content';

export default function Hero({ hero }: { hero: HeroBlock }) {
  return (
    <section className="container-wide section-y">
      {hero.eyebrow ? <span className="eyebrow">{hero.eyebrow}</span> : null}
      <h1 className="max-w-[18ch] text-36 md:text-48">{hero.heading}</h1>
      <p className="mt-6 max-w-[56ch] text-20 text-muted">{hero.sub}</p>
      {hero.primaryCta || hero.secondaryCta ? (
        <div className="mt-8 flex flex-wrap items-center gap-5">
          {hero.primaryCta ? (
            <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
          ) : null}
          {hero.secondaryCta ? (
            <a
              href={hero.secondaryCta.href}
              {...(/^https?:\/\//.test(hero.secondaryCta.href)
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="font-body font-semibold text-cyan"
            >
              {hero.secondaryCta.label}
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
