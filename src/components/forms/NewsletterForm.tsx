'use client';

import { useState } from 'react';
import { useSubscribe } from './useSubscribe';

export default function NewsletterForm() {
  const { status, message, submit } = useSubscribe();
  const [email, setEmail] = useState('');

  if (status === 'success') {
    return <p className="mt-6 text-cyan">Thanks — you&apos;re subscribed.</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit({ email, type: 'newsletter' });
      }}
      className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-3"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="min-w-[200px] flex-1 rounded-[10px] border border-white/10 bg-base px-[18px] py-[14px] text-ink placeholder:text-faint focus:border-cyan focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-[10px] bg-cyan px-[22px] py-[14px] font-semibold text-[#06222a] hover:brightness-110 disabled:opacity-60"
      >
        {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {status === 'error' ? <p className="w-full text-sm text-purple">{message}</p> : null}
    </form>
  );
}
