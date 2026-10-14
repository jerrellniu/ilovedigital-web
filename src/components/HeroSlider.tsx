'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import Button from '@/components/Button';
import CyclingWord from '@/components/CyclingWord';
import { ArrowRight } from '@/components/Icons';
import type { HeroSlide } from '@/types/content';

const AUTOPLAY_MS = 8000;

/**
 * The Home hero: one full-width slide per service or product, with the tabs and
 * arrows laid over the top right. The nav takes the dark theme while a dark slide
 * is showing, so it reads on either ground. Every slide is in the HTML for
 * search engines and screen readers; inactive ones are faded out and made inert.
 * The first slide's heading is the page H1, the rest are H2s, so the page has one
 * H1 whichever slide is showing. Slides stack in one grid cell, so the section
 * keeps the height of the tallest slide and nothing below it jumps when the slide
 * changes.
 *
 * It advances every 8 seconds, pauses while the pointer or keyboard focus is
 * inside it, and never moves on its own for visitors who ask for reduced motion.
 */
export default function HeroSlider({
  label,
  prevLabel,
  nextLabel,
  slides,
  visuals,
  bookingHref,
}: {
  label: string;
  prevLabel: string;
  nextLabel: string;
  slides: HeroSlide[];
  visuals: Partial<Record<HeroSlide['key'], ReactNode>>;
  bookingHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const count = slides.length;
  const dark = slides[index]?.key === 'wallet';

  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const t = window.setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, reducedMotion, go]);

  // React 18 has no `inert` prop, so set it on the element: the hidden slide's
  // links and buttons drop out of the tab order and the accessibility tree.
  useEffect(() => {
    slideRefs.current.forEach((el, i) => {
      if (el) el.inert = i !== index;
    });
  }, [index]);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = ((index + (e.key === 'ArrowRight' ? 1 : -1)) % count + count) % count;
    go(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div
        {...(dark ? { 'data-theme': 'dark' } : {})}
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
      >
        <div className="container-wide flex items-center gap-2 pt-5 sm:justify-end md:pt-6">
          <div
            role="tablist"
            aria-label={label}
            className="pointer-events-auto -mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0"
          >
            {slides.map((s, i) => (
              <button
                key={s.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`hero-tab-${s.key}`}
                aria-controls={`hero-slide-${s.key}`}
                aria-selected={i === index}
                tabIndex={i === index ? 0 : -1}
                onClick={() => go(i)}
                onKeyDown={onTabKey}
                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-14 transition ${
                  i === index ? 'border-ink bg-ink text-base' : 'border-line text-ink hover:border-ink'
                }`}
              >
                {s.tab}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label={prevLabel}
            onClick={() => go(index - 1)}
            className={`pointer-events-auto hidden h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink transition hover:shadow-card-hover sm:inline-flex ${
              dark ? 'bg-surface' : 'bg-base'
            }`}
          >
            <ArrowRight size={18} className="rotate-180" />
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={() => go(index + 1)}
            className={`pointer-events-auto hidden h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink transition hover:shadow-card-hover sm:inline-flex ${
              dark ? 'bg-surface' : 'bg-base'
            }`}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid">
        {slides.map((s, i) => {
          const active = i === index;
          const Heading = i === 0 ? 'h1' : 'h2';
          return (
            <div
              key={s.key}
              id={`hero-slide-${s.key}`}
              role="tabpanel"
              aria-roledescription="slide"
              aria-labelledby={`hero-tab-${s.key}`}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              aria-hidden={!active}
              {...(s.key === 'wallet' ? { 'data-theme': 'dark' } : {})}
              className={`col-start-1 row-start-1 transition-opacity duration-slow ${
                active ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <div className={`flex h-full flex-col text-ink ${s.key === 'wallet' ? 'bg-base' : 'bg-deep'}`}>
                <div className="container-wide grid flex-1 items-center gap-10 pb-14 pt-24 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:pb-20 lg:pt-28">
                  <div>
                    <span className="eyebrow">{s.eyebrow}</span>
                    <Heading className="text-28 md:text-40 lg:text-48">{s.heading}</Heading>
                    <p className="mt-5 text-21 text-muted">{s.sub}</p>
                    {s.outcome && (
                      <p className="mt-4 text-21 text-ink">
                        {s.outcomeCycle?.length && s.outcome.includes('{cycle}') ? (
                          <>
                            {s.outcome.split('{cycle}')[0]}
                            <CyclingWord words={s.outcomeCycle} active={active} />
                            {s.outcome.split('{cycle}')[1]}
                          </>
                        ) : (
                          s.outcome
                        )}
                      </p>
                    )}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button href={bookingHref} size="lg">
                        {s.bookingLabel}
                      </Button>
                      {s.moreCta && (
                        <a
                          href={s.moreCta.href}
                          className="group inline-flex items-center justify-center gap-2 rounded-full border border-accent px-7 py-3.5 text-17 text-accent transition hover:bg-accent-soft active:scale-[0.97]"
                        >
                          {s.moreCta.label}
                          <ArrowRight />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>{visuals[s.key]}</div>
                </div>
                {s.caption && <p className="container-wide pb-6 text-14 text-muted">{s.caption}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
