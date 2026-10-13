import type { Testimonial } from '@/types/content';
import { StarRating } from './Icons';

export default function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex flex-col rounded-card bg-surface p-8">
      <div className="mb-5 flex items-center justify-between">
        <svg width="30" height="30" viewBox="0 0 24 24" className="fill-purple opacity-60" aria-hidden="true">
          <path d="M9.5 6C6.5 7.4 5 9.9 5 13.5V18h5v-5H7.6c.2-1.9 1.1-3.1 2.9-3.8L9.5 6zm9 0c-3 1.4-4.5 3.9-4.5 7.5V18h5v-5h-2.4c.2-1.9 1.1-3.1 2.9-3.8L18.5 6z" />
        </svg>
        <StarRating />
      </div>
      <blockquote className="flex-1 text-17 text-ink">
        {item.quote}
      </blockquote>
      <figcaption className="mt-6 text-14 font-semibold text-ink">{item.author}</figcaption>
    </figure>
  );
}
