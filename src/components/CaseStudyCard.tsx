import Image from 'next/image';
import Link from 'next/link';
import type { CaseStudyCardData } from '@/types/content';

export default function CaseStudyCard({ data }: { data: CaseStudyCardData }) {
  return (
    <Link
      href={data.href}
      className="group block overflow-hidden rounded-2xl border border-transparent bg-surface transition hover:-translate-y-1 hover:border-cyan/40"
    >
      {/* Gradient placeholder until a case study has a real 16:10 image. */}
      <div className="relative flex aspect-[16/10] items-end overflow-hidden bg-[#20222c] bg-[linear-gradient(135deg,rgba(28,191,212,0.22),rgba(192,132,252,0.22))] p-4">
        {data.image ? (
          <Image
            src={data.image}
            alt={`${data.client} website`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top"
          />
        ) : null}
        <div className="relative flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan/40 bg-deep/70 px-3 py-1.5 text-xs font-semibold text-cyan backdrop-blur">
            {data.tag}
          </span>
          {data.platform ? (
            <span className="rounded-full border border-white/20 bg-deep/70 px-3 py-1.5 text-xs font-semibold text-muted backdrop-blur">
              {data.platform}
            </span>
          ) : null}
        </div>
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
