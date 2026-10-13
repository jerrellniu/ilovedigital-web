'use client';

import { usePathname } from 'next/navigation';

// Hides the site's nav and footer on routes that stand alone. The tap business card's
// profile page (/card/[slug]) is a contact screen opened from a Wallet pass or an NFC
// tap, so it carries its own logo and nothing else.
const STANDALONE_PREFIXES = ['/card/'];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  if (STANDALONE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;
  return <>{children}</>;
}
