import type { Stat } from '@/types/content';

export default function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="border-y border-white/10 bg-deep py-14">
      <div className="container-wide grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-heading text-[clamp(2.2rem,4vw,3rem)] font-extrabold">
              {s.value}
            </div>
            <div className="mt-1 text-[15px] text-faint">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
