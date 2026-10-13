'use client';

import { useState } from 'react';

export default function CookieNotice({ text }: { text: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm rounded-card bg-base/95 p-5 text-14 text-muted shadow-float backdrop-blur sm:right-auto">
      <p>{text}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="mt-3 rounded-full bg-cyan px-4 py-1.5 text-14 text-on-accent transition hover:bg-cyan-hover active:scale-[0.97]"
      >
        Accept
      </button>
    </div>
  );
}
