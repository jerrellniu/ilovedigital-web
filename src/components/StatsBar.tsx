import type { Stat } from '@/types/content';

/**
 * Proof row under the hero. Each stat carries the number, the outcome it describes and
 * the client it belongs to, because an unattributed figure reads as a boast and an
 * attributed one reads as evidence. Left-aligned with hairline dividers rather than
 * centred, so the three read as a row of receipts.
 */
export default function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="border-y border-white/10 bg-deep py-11 md:py-[60px]">
      <div className="container-wide grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-0">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={[
              i > 0 ? 'sm:border-l sm:border-white/10 sm:pl-12' : '',
              i < stats.length - 1 ? 'sm:pr-12' : '',
            ].join(' ')}
          >
            <div className="font-heading text-[clamp(2.4rem,3.6vw,3.125rem)] font-extrabold leading-[1.05]">
              {s.value}
            </div>
            <div className="mt-2.5 text-[1.0625rem] leading-snug text-ink">{s.label}</div>
            {s.source ? <div className="mt-1.5 text-[13px] text-faint">{s.source}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
