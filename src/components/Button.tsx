import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'outline';

const styles: Record<Variant, string> = {
  primary: 'bg-cyan text-[#06222a] hover:brightness-110',
  outline: 'border border-cyan text-cyan hover:bg-cyan/10',
};

export default function Button({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const classes = `inline-flex items-center gap-2 rounded-[10px] px-[22px] py-[15px] font-body text-base font-semibold transition ${styles[variant]} ${className}`;

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
