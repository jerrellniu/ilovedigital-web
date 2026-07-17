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
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-[10px] px-[22px] py-[15px] font-body text-base font-semibold transition ${styles[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
