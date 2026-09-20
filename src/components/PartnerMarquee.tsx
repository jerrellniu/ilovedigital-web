import { TOOL_LOGOS } from './toolLogos';
import type { Partner } from '@/types/content';

/**
 * Partnerships and memberships, scrolling right to left under the stats bar. Reuses the
 * marquee CSS in globals.css: two identical tracks translated by one track width, so the
 * seam is invisible, with the duplicate hidden from screen readers and motion off for
 * anyone who asks for reduced motion.
 *
 * Squarespace and Shopify run partner programmes with badges for members, so they carry
 * their marks. Apple and Google grant no equivalent, so those two render as wordmarks.
 */
function markFor(icon?: string): string | undefined {
  if (!icon) return undefined;
  return TOOL_LOGOS.find((l) => l.name.toLowerCase() === icon.toLowerCase())?.path;
}

function Mark({ partner }: { partner: Partner }) {
  const path = markFor(partner.icon);
  return (
    <li className="flex shrink-0 items-center gap-2.5 px-7 text-muted">
      {path ? (
        <svg
          className="h-[22px] w-[22px] shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={path} />
        </svg>
      ) : null}
      <span className="whitespace-nowrap text-[15px] font-medium">{partner.name}</span>
    </li>
  );
}

export default function PartnerMarquee({ partners }: { partners?: Partner[] }) {
  if (!partners?.length) return null;
  // Repeat the set so one track is always wider than the viewport; without that the
  // translate lands mid-gap and the loop visibly jumps.
  const run = [...partners, ...partners, ...partners];
  return (
    <div className="border-b border-white/10 bg-base py-7">
      <div className="marquee relative overflow-hidden">
        <ul className="marquee-track flex w-max items-center">
          {run.map((p, i) => (
            <Mark key={`${p.name}-${i}`} partner={p} />
          ))}
        </ul>
        <ul className="marquee-track flex w-max items-center" aria-hidden="true">
          {run.map((p, i) => (
            <Mark key={`${p.name}-dup-${i}`} partner={p} />
          ))}
        </ul>
      </div>
    </div>
  );
}
