'use client';

import { useState } from 'react';
import { useSubscribe } from './useSubscribe';
import Honeypot from './Honeypot';
import Turnstile from './Turnstile';
import type { CopyTemplatePageContent } from '@/types/content';

// Lead magnet signup. The download appears as soon as the signup is recorded, so the
// visitor never depends on an email arriving to get what they asked for.
export default function TemplateForm({ copy }: { copy: CopyTemplatePageContent['form'] }) {
  const { status, message, submit } = useSubscribe();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [token, setToken] = useState('');

  if (status === 'success') {
    return (
      <div role="status">
        <h3 className="text-21">{copy.successHeading}</h3>
        <p className="mt-2 text-17 text-muted">{copy.successBody}</p>
        <a
          href={copy.file}
          download
          className="mt-6 inline-block rounded-full bg-cyan px-[22px] py-3 text-17 text-on-accent transition hover:bg-cyan-hover active:scale-[0.97]"
        >
          {copy.download}
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit({ name, email, hp, token, type: 'template' });
      }}
      className="relative flex flex-col gap-3"
    >
      <Honeypot id="template-company-url" value={hp} onChange={(e) => setHp(e.target.value)} />

      <label htmlFor="template-name" className="sr-only">
        {copy.nameLabel}
      </label>
      <input
        id="template-name"
        name="name"
        type="text"
        autoComplete="given-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={copy.nameLabel}
        className="field"
      />

      <label htmlFor="template-email" className="sr-only">
        {copy.emailLabel}
      </label>
      <input
        id="template-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={copy.emailLabel}
        className="field"
      />

      <Turnstile onToken={setToken} />

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-1 self-start rounded-full bg-cyan px-[22px] py-3 text-17 text-on-accent transition hover:bg-cyan-hover active:scale-[0.97] disabled:opacity-60"
      >
        {status === 'loading' ? copy.loading : copy.button}
      </button>

      {status === 'error' ? (
        <p className="text-14 text-purple" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
