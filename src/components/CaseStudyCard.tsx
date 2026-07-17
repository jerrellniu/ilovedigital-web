import Link from 'next/link';
import type { CaseStudyCardData } from '@/types/content';

export default function CaseStudyCard({ data }: { data: CaseStudyCardData }) {
  return (
    <Link
      href={data.href}
      className="group block overflow-hidden rounded-2xl border border-transparent bg-surface transition hover:-translate-y-1 hover:border-cyan/40"
    >
      {/* TODO: replace gradient placeholder with a real 16:10 case-study image */}
      <div className="relative flex aspect-[16/10] items-end bg-[linear-gradient(135deg,rgba(28,191,212,0.22),rgba(192,132,252,0.22)),#20222c] p-4">
        <span className="rounded-full border border-cyan/40 bg-deep/70 px-3 py-1.5 text-xs font-semibold text-cyan backdrop-blur">
          {data.tag}
        </span>
      </div>
      <div className="p-6">
        <div className="font-heading text-lg font-bold">{data.client}</div>
        <div className="mt-2 font-body text-[1.05rem] font-semibold">{data.headline}</div>
        <div className="mt-2.5 text-[0.92rem] text-faint">{data.outcome}</div>
        <div className="mt-4 font-body font-semibold text-cyan">View case study →</div>
      </div>
    </Link>
  );
}
