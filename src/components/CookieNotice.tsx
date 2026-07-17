'use client';

import { useState } from 'react';

export default function CookieNotice({ text }: { text: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm rounded-xl border border-white/10 bg-deep/95 p-4 text-[13px] text-muted backdrop-blur">
      <p>{text}</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="mt-3 rounded-lg bg-cyan px-4 py-1.5 text-[13px] font-semibold text-[#06222a]"
      >
        Accept
      </button>
    </div>
  );
}
