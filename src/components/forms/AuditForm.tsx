'use client';

import { useState } from 'react';
import { useSubscribe } from './useSubscribe';

const inputCls =
  'min-w-[200px] flex-1 rounded-[10px] border border-white/10 bg-surface px-[18px] py-[15px] text-ink placeholder:text-faint focus:border-cyan focus:outline-none';

export default function AuditForm({ full = false }: { full?: boolean }) {
  const { status, message, submit } = useSubscribe();
  const [form, setForm] = useState({ website: '', email: '', name: '', business: '', concern: '' });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (status === 'success') {
    return (
      <p className="mt-8 text-cyan">
        Thanks — your audit request is in. You&apos;ll hear back within 3 business days.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit({
          email: form.email,
          website: form.website,
          name: form.name,
          business: form.business,
          message: form.concern,
          type: 'audit',
        });
      }}
      className={`mt-8 w-full max-w-[640px] ${full ? 'space-y-3' : 'flex flex-wrap gap-3'}`}
    >
      <input type="url" required value={form.website} onChange={set('website')} placeholder="Your website URL" className={full ? `${inputCls} w-full` : inputCls} />
      <input type="email" required value={form.email} onChange={set('email')} placeholder="Your email" className={full ? `${inputCls} w-full` : inputCls} />
      {full ? (
        <>
          <input type="text" required value={form.name} onChange={set('name')} placeholder="Your name" className={`${inputCls} w-full`} />
          <input type="text" required value={form.business} onChange={set('business')} placeholder="Business name" className={`${inputCls} w-full`} />
          <textarea value={form.concern} onChange={set('concern')} placeholder="Your biggest concern about your website (optional)" rows={3} className={`${inputCls} w-full`} />
        </>
      ) : null}
      <button
        type="submit"
        disabled={status === 'loading'}
        className={`rounded-[10px] bg-cyan px-[22px] py-[15px] font-semibold text-[#06222a] hover:brightness-110 disabled:opacity-60 ${full ? 'w-full' : ''}`}
      >
        {status === 'loading' ? 'Sending…' : 'Request my audit'}
      </button>
      {status === 'error' ? <p className="w-full text-sm text-purple">{message}</p> : null}
    </form>
  );
}
