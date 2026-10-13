// Inline SVG icons from the design system. No unicode glyphs stand in for icons:
// characters like ★ and + render in whatever font the visitor has, so their size,
// weight and baseline drift between devices. These draw the same everywhere and
// take their colour from `currentColor`.

import type { FeatureIconName } from '@/types/content';

const STAR_PATH = 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L4.5 9.7l5.9-.9z';

/** Five-star rating. Filled stars up to `rating`, outlined after. Announced once as "N out of 5 stars". */
export function StarRating({
  rating = 5,
  size = 18,
  className = '',
}: {
  rating?: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex gap-[3px] text-accent ${className}`} role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

/** Plus sign that turns into a minus when `open`. Used as the FAQ disclosure marker. */
export function PlusMinusIcon({ open, size = 20, className = '' }: { open: boolean; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path
        d="M12 5v14"
        className="origin-center transition-transform"
        style={{ transformBox: 'fill-box', transform: open ? 'scaleY(0)' : 'scaleY(1)' }}
      />
    </svg>
  );
}

/** Right arrow for link labels ("Learn more", "View case study"). Nudges 4px on hover
 *  when its link has the `group` class. */
export function ArrowRight({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform group-hover:translate-x-1 ${className}`}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const FEATURE_ICON_PATHS: Record<FeatureIconName, string[]> = {
  card: ['M5 6h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z', 'M3 10h18M7 15h4'],
  refresh: ['M20 12a8 8 0 1 1-2.3-5.7', 'M20 4v5h-5'],
  scan: ['M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3', 'M8 8h3v3H8zM13 13h3v3h-3zM13 8h3M8 13v3'],
  lock: ['M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z', 'M8 11V7a4 4 0 0 1 8 0v4'],
  form: ['M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M8 8h8M8 12h8M8 16h5'],
  toggle: ['M7 7h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 7z', 'M16 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  shield: ['M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7z', 'm9 12 2 2 4-4'],
};

/** Line icon for a product feature card, drawn in the badge's text colour. */
export function FeatureIcon({ name, size = 24, className = '' }: { name: FeatureIconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {FEATURE_ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
