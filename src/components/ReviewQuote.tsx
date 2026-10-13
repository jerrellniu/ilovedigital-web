import { StarRating } from './Icons';

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
    <figure className="rounded-card bg-surface p-8 md:p-10">
      {review.stars ? (
        <div className="mb-5">
          <StarRating rating={review.stars} size={20} />
        </div>
      ) : null}

      <blockquote className="max-w-[62ch] space-y-4 text-17 text-ink">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </blockquote>

      <figcaption className="mt-6 text-14 font-semibold text-ink">
        {review.author}
        {review.business ? `, ${review.business}` : ''}
        {review.source ? (
          <span className="font-normal text-muted"> — {review.source}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
