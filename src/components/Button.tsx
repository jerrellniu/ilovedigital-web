import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'outline';
type Size = 'md' | 'lg';

// Design system buttons: every button is a pill. Primary is a cyan fill with dark teal
// text (7.44:1); outline is cyan text and border. Press shrinks to 0.97.
const styles: Record<Variant, string> = {
  primary: 'bg-cyan text-on-accent hover:bg-cyan-hover active:bg-cyan-press',
  outline: 'border border-accent text-accent hover:bg-accent-soft',
};

const sizes: Record<Size, string> = {
  md: 'px-[22px] py-3',
  lg: 'px-7 py-3.5',
};

export default function Button({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const classes = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-body text-17 transition active:scale-[0.97] ${sizes[size]} ${styles[variant]} ${className}`;

  // The booking CTA points at Google Calendar, off this domain. next/link is for
  // internal navigation — an external href needs a plain anchor, opened in a new
  // tab so the visitor does not lose the page they were reading, with noopener
  // so the booking page gets no handle on this window.
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
