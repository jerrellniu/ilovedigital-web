import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from './Icons';
import type { CaseStudyCardData } from '@/types/content';

// Design system case study card: a full-bleed 16:10 image with its category chips over
// the top, then the title, one outcome line and a "View case study" link. Flat card;
// hover adds the soft card shadow and the image scales slightly.
const SHELL = 'group flex h-full flex-col overflow-hidden rounded-card bg-surface';
const INTERACTIVE = 'transition hover:shadow-card-hover';

/** Brand tint behind the monogram, and under a screenshot while it loads. */
const TINT =
  'bg-[linear-gradient(135deg,rgba(192,132,252,0.28),rgba(28,191,212,0.28))]';

/** Chip over the image: dark translucent pill, cyan label. */
const CHIP =
  'whitespace-nowrap rounded-full bg-[rgba(12,14,19,0.72)] px-3 py-1.5 text-12 font-semibold uppercase tracking-[0.04em] text-cyan backdrop-blur-[6px]';

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
      <div className={`relative aspect-[16/10] overflow-hidden ${TINT}`}>
        {data.image ? (
          <Image
            src={data.image}
            alt={data.imageAlt ?? `${data.client} website`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-slow group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center" aria-hidden="true">
            <span className="font-heading text-48 font-semibold tracking-wider text-white/70">
              {initials(data.client)}
            </span>
          </div>
        )}
        <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
          <span className={CHIP}>{data.tag}</span>
          {data.platform ? <span className={CHIP}>{data.platform}</span> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-21">{data.service ?? data.client}</h3>
        {/* One description line only. `headline` is the case study's H1 and is not
            repeated on the card; it falls back in when there is no outcome line. */}
        <p className="mt-2 text-17 text-muted">{data.outcome ?? data.headline}</p>
        {data.href ? (
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-17 font-semibold text-accent">
            View case study
            <ArrowRight />
          </span>
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
