'use client';

import { useState } from 'react';
import { useSubscribe } from './useSubscribe';
import Honeypot from './Honeypot';
import Turnstile from './Turnstile';

export default function NewsletterForm() {
  const { status, message, submit } = useSubscribe();
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [token, setToken] = useState('');

  if (status === 'success') {
    return (
      <p className="mt-6 text-accent" role="status">
        Thanks — you&apos;re subscribed.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit({ email, hp, token, type: 'newsletter' });
      }}
      className="relative mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-3"
    >
      <Honeypot id="newsletter-company-url" value={hp} onChange={(e) => setHp(e.target.value)} />

      <label htmlFor="newsletter-email" className="sr-only">
        Your email
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="field min-w-[200px] flex-1"
      />

      <Turnstile onToken={setToken} />

      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-full bg-cyan px-[22px] py-3 text-17 text-on-accent transition hover:bg-cyan-hover active:scale-[0.97] disabled:opacity-60"
      >
        {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>

      {status === 'error' ? (
        <p className="w-full text-14 text-purple" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
