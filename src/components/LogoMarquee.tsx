import { TOOL_LOGOS, type ToolLogo } from './toolLogos';

function Mark({ logo }: { logo: ToolLogo }) {
  return (
    <li className="flex shrink-0 items-center gap-2.5 px-7 text-faint transition-colors hover:text-ink">
      {logo.path ? (
        <svg
          className="h-7 w-7 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          role="img"
          aria-label={logo.name}
        >
          <path d={logo.path} />
        </svg>
      ) : (
        <span className="whitespace-nowrap font-heading text-[0.95rem] font-bold tracking-tight">
          {logo.name}
        </span>
      )}
    </li>
  );
}

/**
 * Continuous logo strip. The list is rendered twice and the track is translated by
 * exactly half its width, so the seam lands where the second copy starts and the loop
 * is invisible. The duplicate is aria-hidden so a screen reader hears each tool once.
 * Motion is off for anyone who asks for reduced motion — the strip wraps instead.
 */
export default function LogoMarquee() {
  return (
    <div className="marquee relative overflow-hidden">
      <ul className="marquee-track flex w-max items-center">
        {TOOL_LOGOS.map((l) => (
          <Mark key={l.name} logo={l} />
        ))}
      </ul>
      <ul className="marquee-track flex w-max items-center" aria-hidden="true">
        {TOOL_LOGOS.map((l) => (
          <Mark key={`${l.name}-dup`} logo={l} />
        ))}
      </ul>
    </div>
  );
}
