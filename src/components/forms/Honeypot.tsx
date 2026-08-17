'use client';

/**
 * Spam trap. A real person never sees or tabs to this field, so anything that
 * arrives with it filled in is a bot. The server drops those submissions
 * silently — see the `hp` check in `src/app/api/subscribe/route.ts`.
 *
 * Positioned off-screen rather than `display: none`, because a fair share of
 * form-filling bots skip hidden inputs but happily fill a positioned one.
 * `aria-hidden` plus `tabIndex={-1}` keeps it away from screen readers and the
 * keyboard, and the label is there for the same reason — a bot reading the DOM
 * sees a plausible field.
 *
 * `id` must be unique per page, since two forms can share a page.
 */
export default function Honeypot({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
      <label htmlFor={id}>Leave this field empty</label>
      <input
        id={id}
        name="company_url"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
