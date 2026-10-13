// Inline SVG icons from the design system. No unicode glyphs stand in for icons:
// characters like ★ and + render in whatever font the visitor has, so their size,
// weight and baseline drift between devices. These draw the same everywhere and
// take their colour from `currentColor`.

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
