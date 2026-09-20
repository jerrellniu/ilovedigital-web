import type { HeroBlock } from '@/types/content';

const ACCENT = {
  cyan: 'text-cyan',
  purple: 'text-purple',
} as const;

/**
 * The page H1, rendered from content. The accent colours are part of the copy
 * decision — which word is cyan and which is purple — so they live in
 * `hero.headingParts` rather than being hardcoded here. A hero with no parts
 * renders its heading flat.
 */
export default function HeroHeading({
  hero,
  className = '',
}: {
  hero: HeroBlock;
  className?: string;
}) {
  return (
    <h1 className={className}>
      {hero.headingParts
        ? hero.headingParts.map((part, i) =>
            part.accent ? (
              <span key={i} className={ACCENT[part.accent]}>
                {part.text}
              </span>
            ) : (
              <span key={i}>{part.text}</span>
            )
          )
        : hero.heading}
    </h1>
  );
}
