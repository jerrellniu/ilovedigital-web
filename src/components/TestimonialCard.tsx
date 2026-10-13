import type { Testimonial } from '@/types/content';
import { StarRating } from './Icons';

export default function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex flex-col rounded-2xl bg-surface p-8">
      <StarRating className="mb-4" />
      <blockquote className="flex-1 text-16 leading-7 text-muted">
        {item.quote}
      </blockquote>
      <figcaption className="mt-5 text-14 font-semibold">{item.author}</figcaption>
    </figure>
  );
}
