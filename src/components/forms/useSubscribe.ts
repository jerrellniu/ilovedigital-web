'use client';

import { useState } from 'react';
import { metaPayload, newEventId, track, type MetaEventName } from '@/lib/meta';

// Must match META_EVENT in src/app/api/subscribe/route.ts.
const META_EVENT: Record<string, MetaEventName> = {
  contact: 'Lead',
  audit: 'Lead',
  template: 'CompleteRegistration',
  newsletter: 'CompleteRegistration',
};

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useSubscribe() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function submit(payload: Record<string, string>) {
    setStatus('loading');
    setMessage('');
    const eventId = newEventId();
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, ...metaPayload(eventId) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      const event = META_EVENT[payload.type];
      if (event) track(event, eventId);
      setStatus('success');
    } catch (e) {
      setStatus('error');
      setMessage((e as Error).message);
    }
  }

  return { status, message, submit };
}
