import Image from 'next/image';
import Link from 'next/link';
import type { CaseStudyCardData } from '@/types/content';

const SHELL = 'group block overflow-hidden rounded-2xl border border-transparent bg-surface';
const INTERACTIVE = 'transition hover:-translate-y-1 hover:border-cyan/40';

/** Quiet brand tint behind the monogram, and under a screenshot while it loads. */
const TINT =
  'bg-[#20222c] bg-[linear-gradient(135deg,rgba(28,191,212,0.22),rgba(192,132,252,0.22))]';

/** "The Boxing Shop" -> "TB". Fallback mark for a case study with no thumbnail yet. */
function initials(client: string): string {
  return client
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export default function CaseStudyCard({ data }: { data: CaseStudyCardData }) {
  const body = (
    <>
      <div className="flex aspect-[16/10] flex-col">
        {/* Browser chrome — window dots left, tag and platform right. */}
        <div className="flex h-8 shrink-0 items-center justify-between gap-3 bg-[#181a22] px-3">
          <div className="flex shrink-0 gap-1.5" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="whitespace-nowrap rounded-full border border-cyan/40 px-2 py-0.5 text-[0.65rem] font-semibold text-cyan">
              {data.tag}
            </span>
            {data.platform ? (
              <span className="whitespace-nowrap rounded-full border border-white/20 px-2 py-0.5 text-[0.65rem] font-semibold text-muted">
                {data.platform}
              </span>
            ) : null}
          </div>
        </div>

        <div className={`relative flex-1 overflow-hidden ${TINT}`}>
          {data.image ? (
            <Image
              src={data.image}
              alt={data.imageAlt ?? `${data.client} website`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover object-top [filter:grayscale(15%)_saturate(0.85)_contrast(1.05)] transition-[filter,transform] duration-500 group-hover:scale-[1.03] group-hover:[filter:grayscale(0)_saturate(100%)_contrast(1.05)]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-heading text-3xl font-bold tracking-wider text-white/15">
                {initials(data.client)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="font-heading text-lg font-bold">{data.client}</div>
        <div className="mt-2 font-body text-[1.05rem] font-semibold">{data.headline}</div>
        {data.outcome ? (
          <div className="mt-2.5 text-[0.92rem] text-faint">{data.outcome}</div>
        ) : null}
        {data.href ? (
          <div className="mt-4 font-body font-semibold text-cyan">View case study →</div>
        ) : null}
      </div>
    </>
  );

  // No href means the case study isn't published yet. Render the card as plain
  // content — the work still shows, but there's nothing to click through to.
  if (!data.href) {
    return <div className={SHELL}>{body}</div>;
  }

  return (
    <Link href={data.href} className={`${SHELL} ${INTERACTIVE}`}>
      {body}
    </Link>
  );
}
