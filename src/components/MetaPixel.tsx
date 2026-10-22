'use client';

import { Suspense, useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { AUDIT_EMAIL_KEY, newEventId, track } from '@/lib/meta';
import { recordFirstTouch } from '@/lib/attribution';

// Digits only: the ID is written into an inline script.
const RAW_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
const PIXEL_ID = RAW_ID && /^\d+$/.test(RAW_ID) ? RAW_ID : undefined;

// Base code, written out here rather than pasted from Events Manager so the ID comes
// from the environment. Before init it moves any legacy `email` query parameter
// (old /audit?website=...&email=... links) into sessionStorage, so the first PageView
// never sends an email address to Meta in the URL.
const baseCode = (id: string) => `
(function(){try{var u=new URL(location.href);var e=u.searchParams.get('email');
if(e!==null){try{sessionStorage.setItem('${AUDIT_EMAIL_KEY}',e)}catch(_){}
u.searchParams.delete('email');history.replaceState(history.state,'',u.pathname+u.search+u.hash)}}catch(_){}})();
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${id}');
fbq('track','PageView');
`;

/** Booking links: the appointment schedules and the calendar.app.google short link. */
function isContactLink(href: string): boolean {
  if (href.startsWith('tel:')) return true;
  try {
    const url = new URL(href, window.location.href);
    if (url.hostname === 'calendar.app.google') return true;
    return url.hostname === 'calendar.google.com' && url.pathname.includes('/appointments/');
  } catch {
    return false;
  }
}

/**
 * App Router navigation never reloads the page, so the base code's PageView only
 * covers the first load. This fires one for every later route change. The key skips
 * `email` so stripping it from the URL does not count as a second view.
 */
function RouteChangePageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const last = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('email');
    const key = `${pathname}?${params.toString()}`;
    if (last.current === null) {
      last.current = key;
      return;
    }
    if (key === last.current) return;
    last.current = key;
    track('PageView', newEventId());
  }, [pathname, searchParams]);

  return null;
}

/**
 * Meta Pixel. Renders nothing without NEXT_PUBLIC_META_PIXEL_ID, so local builds
 * stay clean. Contact fires in the browser only, on phone and booking link clicks:
 * bookings complete inside Google's cross-origin iframe, so the site can never
 * confirm one, and a click is the honest signal.
 */
export default function MetaPixel() {
  // First-touch lead source (src/lib/attribution.ts). Runs with or without a Pixel
  // ID, because forms need the source either way.
  useEffect(() => {
    recordFirstTouch();
  }, []);

  useEffect(() => {
    if (!PIXEL_ID) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]');
      const href = link?.getAttribute('href');
      if (href && isContactLink(href)) track('Contact', newEventId());
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {baseCode(PIXEL_ID)}
      </Script>
      <Suspense fallback={null}>
        <RouteChangePageView />
      </Suspense>
    </>
  );
}
