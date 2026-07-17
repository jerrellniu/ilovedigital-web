'use client';

import { useState } from 'react';
import { useSubscribe } from './useSubscribe';

const inputCls =
  'w-full rounded-[10px] border border-white/10 bg-base px-4 py-3 text-ink placeholder:text-faint focus:border-cyan focus:outline-none';

export default function ContactForm() {
  const { status, message, submit } = useSubscribe();
  const [form, setForm] = useState({ name: '', email: '', business: '', message: '' });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (status === 'success') {
    return <p className="mt-6 text-cyan">Thanks — your message is on its way. I&apos;ll reply within one business day.</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit({ ...form, type: 'contact' });
      }}
      className="mt-6 space-y-4"
    >
      <input type="text" required value={form.name} onChange={set('name')} placeholder="Your name" className={inputCls} />
      <input type="email" required value={form.email} onChange={set('email')} placeholder="Email" className={inputCls} />
      <input type="text" required value={form.business} onChange={set('business')} placeholder="Business name" className={inputCls} />
      <textarea required value={form.message} onChange={set('message')} placeholder="Message" rows={4} className={inputCls} />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-[10px] bg-cyan px-[22px] py-[14px] font-semibold text-[#06222a] hover:brightness-110 disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending…' : 'Send message'}
      </button>
      {status === 'error' ? <p className="text-sm text-purple">{message}</p> : null}
    </form>
  );
}
