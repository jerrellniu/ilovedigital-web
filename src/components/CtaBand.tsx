import Button from './Button';
import type { CtaLink } from '@/types/content';

// Design system closing CTA: a white panel on the grey deep ground, centred headline and
// a large primary pill, with the logo heart as a faint watermark.
export default function CtaBand({
  heading,
  sub,
  button,
}: {
  heading: string;
  sub?: string;
  button: CtaLink;
}) {
  return (
    <section className="section-deep">
      <div className="container-wide section-y">
        <div className="relative overflow-hidden rounded-panel bg-base px-6 py-14 text-center md:px-12 md:py-16">
          <svg
            viewBox="0 0 100 89"
            className="pointer-events-none absolute -right-10 -top-8 h-[250px] w-[280px] opacity-[0.06]"
            aria-hidden="true"
          >
            <path
              d="M45.76 87.18L8.58 50A29.29 29.29 0 0 1 50 8.58A29.29 29.29 0 0 1 91.42 50L54.24 87.18A6 6 0 0 1 45.76 87.18Z"
              fill="currentColor"
              className="text-accent"
            />
          </svg>
          <div className="relative mx-auto max-w-[640px]">
            <h2 className="text-28 md:text-40">{heading}</h2>
            {sub ? <p className="mt-4 text-21 text-muted">{sub}</p> : null}
            <div className="mt-8">
              <Button href={button.href} size="lg">
                {button.label}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
