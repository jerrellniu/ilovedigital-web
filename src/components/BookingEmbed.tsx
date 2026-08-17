/**
 * Google Calendar appointment schedule, embedded.
 *
 * The `?gv=true` query is what makes the schedule render as a bookable grid
 * rather than the standalone Google-chrome booking page. The URL must be the
 * public `/calendar/appointments/schedules/...` form — the `/u/0/` variant
 * Google shows while you are signed in is account-scoped and will not load for
 * a visitor.
 *
 * `loading="lazy"` matters here: the embed pulls a fair amount of Google
 * JavaScript, and on `/audit` it sits below the fold behind the form, which is
 * the conversion path we do not want to slow down.
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
  /** Where the "having trouble" link points. Defaults to the embed URL. */
  fallbackHref?: string;
  height?: number;
}) {
  return (
    <div className="mt-6">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        style={{ height }}
        className="w-full rounded-xl border border-white/10 bg-white"
      />
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
