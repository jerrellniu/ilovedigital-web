'use client';

import { useState } from 'react';

/**
 * Google Calendar appointment schedule, embedded.
 *
 * The `?gv=true` query is what makes the schedule render as a bookable grid
 * rather than the standalone Google-chrome booking page. The URL must be the
 * public `/calendar/appointments/schedules/...` form — the `/u/0/` variant
 * Google shows while you are signed in is account-scoped and will not load for
 * a visitor.
 *
 * **Give it width.** Below roughly 700px Google collapses to a single narrow
 * column with its own internal scrollbar, and the visitor has to scroll inside
 * the iframe to reach any time slot. At full width it lays out two panes with
 * the times visible immediately. Do not drop this into a half-width grid cell.
 *
 * The embed takes five to eight seconds to paint, so it renders behind a
 * skeleton rather than a blank white rectangle — an untreated blank box on a
 * dark page reads as broken, and a visitor who thinks the booking is broken
 * does not book.
 *
 * The fallback link is not decoration. The iframe is third-party and is blocked
 * by some privacy extensions and strict corporate networks, which fails silently
 * as an empty box. A visible link underneath means a blocked embed still books
 * a call instead of costing one.
 */
export default function BookingEmbed({
  src,
  title = 'Book a call with Jerrell',
  fallbackHref,
  height = 620,
}: {
  src: string;
  title?: string;
  /** Where the "calendar not loading" link points. Defaults to the embed URL. */
  fallbackHref?: string;
  height?: number;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="mt-6">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-white/10"
        style={{ height }}
      >
        {!loaded ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface"
            aria-hidden="true"
          >
            <span className="h-6 w-6 rounded-full border-2 border-white/20 border-t-cyan motion-safe:animate-spin" />
            <span className="text-sm text-faint">Loading available times…</span>
          </div>
        ) : null}

        <iframe
          src={src}
          title={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full bg-white transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <p className="mt-3 text-[0.85rem] text-faint">
        Calendar not loading?{' '}
        <a
          href={fallbackHref ?? src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan hover:underline"
        >
          Open the booking page in a new tab
        </a>
        .
      </p>
    </div>
  );
}
