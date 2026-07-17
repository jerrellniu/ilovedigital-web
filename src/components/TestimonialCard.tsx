import type { Testimonial } from '@/types/content';

export default function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex flex-col rounded-2xl bg-surface p-8">
      <div className="mb-4 tracking-[2px] text-cyan" aria-hidden="true">
        ★★★★★
      </div>
      <blockquote className="flex-1 text-[0.98rem] leading-7 text-muted">
        {item.quote}
      </blockquote>
      <figcaption className="mt-5 text-[0.9rem] font-semibold">{item.author}</figcaption>
    </figure>
  );
}
