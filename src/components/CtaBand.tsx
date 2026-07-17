import Button from './Button';
import type { CtaLink } from '@/types/content';

export default function CtaBand({
  heading,
  button,
}: {
  heading: string;
  button: CtaLink;
}) {
  return (
    <section className="bg-deep">
      <div className="container-wide section-y text-center">
        <h2 className="mx-auto max-w-[24ch] text-[clamp(1.8rem,3.2vw,2.6rem)]">{heading}</h2>
        <div className="mt-8">
          <Button href={button.href}>{button.label}</Button>
        </div>
      </div>
    </section>
  );
}
