import type { Stat } from '@/types/content';

/** Leading digits, then whatever unit follows. "175%" → "175" + "%"; "1,482" → "1,482" + "". */
const VALUE = /^([\d.,\s]*)(.*)$/;

function TrendArrow({ direction }: { direction: NonNullable<Stat['trend']> }) {
  const up = direction === 'up';
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-1.5 inline-block h-[0.52em] w-[0.52em] text-cyan"
      aria-hidden="true"
    >
      <line x1="12" y1={up ? 21 : 3} x2="12" y2={up ? 4 : 20} />
      <polyline points={up ? '4 12 12 4 20 12' : '4 12 12 20 20 12'} />
    </svg>
  );
}

/**
 * Proof row under the hero. Each stat carries the number, the outcome it describes and
 * the client it belongs to, because an unattributed figure reads as a boast and an
 * attributed one reads as evidence. Left-aligned with hairline dividers rather than
 * centred, so the three read as a row of receipts.
 *
 * The unit on the end of a value — the per cent sign, the plus — is painted in the
 * primary accent so the eye lands on the digits first. A stat with no unit can carry a
 * trend arrow instead, in the same colour, so every row reads the same way.
 */
export default function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="border-y border-white/10 bg-deep py-11 md:py-[60px]">
      <div className="container-wide grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-0">
        {stats.map((s, i) => {
          const [, digits, unit] = s.value.match(VALUE) ?? [, s.value, ''];
          return (
            <div
              key={s.label}
              className={[
                i > 0 ? 'sm:border-l sm:border-white/10 sm:pl-12' : '',
                i < stats.length - 1 ? 'sm:pr-12' : '',
              ].join(' ')}
            >
              <div className="font-heading text-[clamp(2.4rem,3.6vw,3.125rem)] font-extrabold leading-[1.05]">
                {digits}
                {unit ? <span className="text-cyan">{unit}</span> : null}
                {s.trend ? <TrendArrow direction={s.trend} /> : null}
              </div>
              <div className="mt-2.5 text-[1.0625rem] leading-snug text-ink">{s.label}</div>
              {s.source ? <div className="mt-1.5 text-[13px] text-faint">{s.source}</div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
