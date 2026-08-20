'use client';

import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile widget. Renders nothing visible in its normal state — the
 * "managed" mode only shows a challenge when Cloudflare is unsure about the
 * visitor, so a real person almost never sees or does anything.
 *
 * Renders only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. Until the keys are
 * added the forms behave exactly as before, and the server skips verification to
 * match — see src/lib/turnstile.ts.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export default function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  // Held in a ref so the effect below never has to re-run when the parent
  // re-renders on every keystroke — re-rendering the widget would reset it.
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!siteKey || !ref.current) return;

    let widgetId: string | undefined;
    let cancelled = false;

    const render = () => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        // The site is dark throughout; the widget's default light card reads as
        // something bolted on. Pinned rather than left on 'auto', which follows
        // the visitor's OS preference and would render a white card on the dark
        // page for anyone browsing in light mode — the majority.
        theme: 'dark',
        callback: (token: string) => onTokenRef.current(token),
        // A token is single-use and expires after a few minutes. Clearing it on
        // expiry means a form left open in a tab fails the server check rather
        // than silently sending a token that will be rejected.
        'expired-callback': () => onTokenRef.current(''),
        'error-callback': () => onTokenRef.current(''),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener('load', render);
      } else {
        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', render);
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey]);

  if (!siteKey) return null;
  return <div ref={ref} className="mt-2" />;
}
