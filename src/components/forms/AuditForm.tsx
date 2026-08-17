'use client';

import { useState } from 'react';
import { useSubscribe } from './useSubscribe';
import Honeypot from './Honeypot';

const inputCls =
  'min-w-[200px] flex-1 rounded-[10px] border border-white/10 bg-surface px-[18px] py-[15px] text-ink placeholder:text-faint focus:border-cyan focus:outline-none';

// The compact and full variants both render on the same page in some layouts,
// so field ids are namespaced by variant to keep them unique per document.
export default function AuditForm({ full = false }: { full?: boolean }) {
  const { status, message, submit } = useSubscribe();
  const [form, setForm] = useState({
    website: '',
    email: '',
    name: '',
    business: '',
    concern: '',
    hp: '',
  });

  const ns = full ? 'audit-full' : 'audit';

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (status === 'success') {
    return (
      <p className="mt-8 text-cyan" role="status">
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
          hp: form.hp,
          type: 'audit',
        });
      }}
      className={`relative mt-8 w-full max-w-[640px] ${full ? 'space-y-3' : 'flex flex-wrap gap-3'}`}
    >
      <Honeypot id={`${ns}-company-url`} value={form.hp} onChange={set('hp')} />

      <label htmlFor={`${ns}-website`} className="sr-only">
        Your website URL
      </label>
      <input
        id={`${ns}-website`}
        name="website"
        type="url"
        required
        autoComplete="url"
        value={form.website}
        onChange={set('website')}
        placeholder="Your website URL"
        className={full ? `${inputCls} w-full` : inputCls}
      />

      <label htmlFor={`${ns}-email`} className="sr-only">
        Your email
      </label>
      <input
        id={`${ns}-email`}
        name="email"
        type="email"
        required
        autoComplete="email"
        value={form.email}
        onChange={set('email')}
        placeholder="Your email"
        className={full ? `${inputCls} w-full` : inputCls}
      />

      {full ? (
        <>
          <label htmlFor={`${ns}-name`} className="sr-only">
            Your name
          </label>
          <input
            id={`${ns}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            value={form.name}
            onChange={set('name')}
            placeholder="Your name"
            className={`${inputCls} w-full`}
          />

          <label htmlFor={`${ns}-business`} className="sr-only">
            Business name
          </label>
          <input
            id={`${ns}-business`}
            name="business"
            type="text"
            required
            autoComplete="organization"
            value={form.business}
            onChange={set('business')}
            placeholder="Business name"
            className={`${inputCls} w-full`}
          />

          <label htmlFor={`${ns}-concern`} className="sr-only">
            Your biggest concern about your website (optional)
          </label>
          <textarea
            id={`${ns}-concern`}
            name="concern"
            value={form.concern}
            onChange={set('concern')}
            placeholder="Your biggest concern about your website (optional)"
            rows={3}
            className={`${inputCls} w-full`}
          />
        </>
      ) : null}

      <button
        type="submit"
        disabled={status === 'loading'}
        className={`rounded-[10px] bg-cyan px-[22px] py-[15px] font-semibold text-[#06222a] hover:brightness-110 disabled:opacity-60 ${full ? 'w-full' : ''}`}
      >
        {status === 'loading' ? 'Sending…' : 'Request my audit'}
      </button>

      {status === 'error' ? (
        <p className="w-full text-sm text-purple" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
