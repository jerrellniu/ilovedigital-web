'use client';

import { useState } from 'react';
import { useSubscribe } from './useSubscribe';
import Honeypot from './Honeypot';

const inputCls =
  'w-full rounded-[10px] border border-white/10 bg-base px-4 py-3 text-ink placeholder:text-faint focus:border-cyan focus:outline-none';

export default function ContactForm() {
  const { status, message, submit } = useSubscribe();
  const [form, setForm] = useState({ name: '', email: '', business: '', message: '', hp: '' });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (status === 'success') {
    return (
      <p className="mt-6 text-cyan" role="status">
        Thanks — your message is on its way. I&apos;ll reply within one business day.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit({ ...form, type: 'contact' });
      }}
      className="relative mt-6 space-y-4"
    >
      <Honeypot id="contact-company-url" value={form.hp} onChange={set('hp')} />

      <div>
        <label htmlFor="contact-name" className="sr-only">
          Your name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={form.name}
          onChange={set('name')}
          placeholder="Your name"
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="sr-only">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          placeholder="Email"
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="contact-business" className="sr-only">
          Business name
        </label>
        <input
          id="contact-business"
          name="business"
          type="text"
          required
          autoComplete="organization"
          value={form.business}
          onChange={set('business')}
          placeholder="Business name"
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="sr-only">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          value={form.message}
          onChange={set('message')}
          placeholder="Message"
          rows={4}
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-[10px] bg-cyan px-[22px] py-[14px] font-semibold text-[#06222a] hover:brightness-110 disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending…' : 'Send message'}
      </button>

      {status === 'error' ? (
        <p className="text-sm text-purple" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
