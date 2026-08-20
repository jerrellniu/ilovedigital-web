export interface Review {
  /** Star rating out of 5. Omit to hide the stars entirely. */
  stars?: number;
  /** Where the review was left, e.g. "Google review". Omit if unconfirmed. */
  source?: string;
  author: string;
  business?: string;
  /** Verbatim quote. Blank lines separate paragraphs. */
  quote: string;
}

// Client review, rendered above the case study body. Quotes are verbatim and come
// from the Client Testimonials — Verbatim Library page in Notion, nowhere else.
export default function ReviewQuote({ review }: { review: Review }) {
  const paragraphs = review.quote.trim().split(/\n{2,}/);

  return (
    <figure className="rounded-2xl bg-surface p-8 md:p-10">
      {review.stars ? (
        <div className="mb-5">
          <span className="tracking-[2px] text-[1.1rem] text-cyan" aria-hidden="true">
            {'★'.repeat(review.stars)}
          </span>
          <span className="sr-only">{review.stars} out of 5 stars</span>
        </div>
      ) : null}

      <blockquote className="max-w-[62ch] space-y-4 text-[1.05rem] leading-7 text-muted">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </blockquote>

      <figcaption className="mt-6 text-[0.9rem] font-semibold text-ink">
        {review.author}
        {review.business ? `, ${review.business}` : ''}
        {review.source ? (
          <span className="font-normal text-faint"> — {review.source}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
