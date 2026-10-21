'use client';

import { useEffect, useRef, useState } from 'react';
import Honeypot from './Honeypot';
import Turnstile from './Turnstile';
import AuditReportView from '@/components/audit/AuditReportView';
import type { AuditEvent, AuditReport, ProgressStep } from '@/lib/audit/types';
import { AUDIT_EMAIL_KEY, metaPayload, newEventId, track } from '@/lib/meta';

const inputCls = 'field min-w-[200px] flex-1';

const STEPS: { step: ProgressStep; label: string }[] = [
  { step: 'fetch', label: 'Loading your site' },
  { step: 'crawl', label: 'Reading your robots.txt, sitemap and pages' },
  { step: 'technical', label: 'Checking pages and links' },
  { step: 'speed', label: 'Measuring speed with Google PageSpeed' },
  { step: 'geo', label: 'Checking AI search readiness' },
  { step: 'interpret', label: 'Writing your priorities and plan' },
];

type Phase = 'idle' | 'running' | 'done' | 'error';

function Tick() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-accent" aria-hidden="true">
      <path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 animate-spin text-accent motion-reduce:animate-none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M17 10a7 7 0 0 0-7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Compact variant (Home audit band): website and email only. It hands off to /audit,
 * which prefills and runs the audit there, so the report has room to breathe. Only
 * the website travels in the query string; the email goes through sessionStorage,
 * because the Meta Pixel reports page URLs and must never see an email address.
 *
 * Full variant (/audit): runs the instant audit and renders the report in place.
 */
export default function AuditForm({ full = false, buttonLabel = 'Audit my site' }: { full?: boolean; buttonLabel?: string }) {
  const [form, setForm] = useState({ website: '', email: '', name: '', business: '', concern: '', hp: '' });
  const [token, setToken] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [step, setStep] = useState<ProgressStep | null>(null);
  const [error, setError] = useState('');
  const [report, setReport] = useState<AuditReport | null>(null);
  // Turnstile tokens are single-use, so each run gets a freshly mounted widget.
  const [runKey, setRunKey] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const ns = full ? 'audit-full' : 'audit';
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Prefill from the Home band hand-off (/audit?website=..., email in sessionStorage).
  // A legacy ?email= link is read once and stripped from the URL. MetaPixel's base
  // code strips it too, into sessionStorage, if it happens to run first.
  useEffect(() => {
    if (!full) return;
    const url = new URL(window.location.href);
    const website = url.searchParams.get('website') || '';
    let email = url.searchParams.get('email') || '';
    if (url.searchParams.has('email')) {
      url.searchParams.delete('email');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
    try {
      email = email || sessionStorage.getItem(AUDIT_EMAIL_KEY) || '';
      sessionStorage.removeItem(AUDIT_EMAIL_KEY);
    } catch {
      // Storage blocked: the visitor types the email again.
    }
    if (website || email) setForm((f) => ({ ...f, website: website || f.website, email: email || f.email }));
  }, [full]);

  useEffect(() => {
    if (phase === 'done' || phase === 'running') resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [phase]);

  if (!full) {
    return (
      <form
        action="/audit"
        method="get"
        onSubmit={(e) => {
          const email = (e.currentTarget.elements.namedItem('audit-email') as HTMLInputElement | null)?.value ?? '';
          try {
            sessionStorage.setItem(AUDIT_EMAIL_KEY, email);
          } catch {
            // Storage blocked: /audit asks for the email again.
          }
        }}
        className="relative mt-8 flex w-full max-w-[640px] flex-wrap gap-3"
      >
        <label htmlFor={`${ns}-website`} className="sr-only">Your website URL</label>
        <input id={`${ns}-website`} name="website" type="text" inputMode="url" required autoComplete="url" placeholder="Your website URL" className={inputCls} />
        <label htmlFor={`${ns}-email`} className="sr-only">Your email</label>
        {/* No `name`, so the GET hand-off never puts the email in the URL. */}
        <input id={`${ns}-email`} type="email" required autoComplete="email" placeholder="Your email" className={inputCls} />
        <button
          type="submit"
          className="rounded-full bg-cyan px-[22px] py-3 text-17 text-on-accent transition hover:bg-cyan-hover active:scale-[0.97]"
        >
          {buttonLabel}
        </button>
      </form>
    );
  }

  async function run() {
    setPhase('running');
    setStep('fetch');
    setError('');
    setReport(null);
    const eventId = newEventId();
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'audit',
          email: form.email,
          website: form.website,
          name: form.name,
          business: form.business,
          message: form.concern,
          hp: form.hp,
          token,
          ...metaPayload(eventId),
        }),
      });
      const isStream = (res.headers.get('content-type') || '').includes('ndjson');
      if (!res.ok || !isStream || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      // The stream means the audit was accepted: that is when the lead is captured.
      track('Lead', eventId);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let got = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          const e = JSON.parse(line) as AuditEvent;
          if (e.type === 'progress') setStep(e.step);
          if (e.type === 'error') throw new Error(e.message);
          if (e.type === 'report') {
            got = true;
            setReport(e.report);
            setPhase('done');
          }
        }
      }
      if (!got) throw new Error('The audit stopped before it finished. Your report may still arrive by email; if not, please try again.');
    } catch (e) {
      setPhase('error');
      setError((e as Error).message);
    }
  }

  const currentIndex = step ? STEPS.findIndex((s) => s.step === step) : -1;

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (phase === 'running') return;
          if (phase === 'done' || (phase === 'error' && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)) {
            // A used Turnstile token is rejected, so remount the widget for a fresh
            // one and let the visitor submit again once it is ready.
            setRunKey((k) => k + 1);
            setToken('');
            setReport(null);
            setError('');
            setPhase('idle');
            return;
          }
          run();
        }}
        className="relative mt-8 w-full max-w-[640px] space-y-3"
      >
        <Honeypot id={`${ns}-company-url`} value={form.hp} onChange={set('hp')} />

        <label htmlFor={`${ns}-website`} className="sr-only">Your website URL</label>
        <input id={`${ns}-website`} name="website" type="text" inputMode="url" required autoComplete="url" value={form.website} onChange={set('website')} placeholder="Your website URL" className={`${inputCls} w-full`} />

        <label htmlFor={`${ns}-email`} className="sr-only">Your email</label>
        <input id={`${ns}-email`} name="email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} placeholder="Your email" className={`${inputCls} w-full`} />

        <label htmlFor={`${ns}-name`} className="sr-only">Your name</label>
        <input id={`${ns}-name`} name="name" type="text" required autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your name" className={`${inputCls} w-full`} />

        <label htmlFor={`${ns}-business`} className="sr-only">Business name</label>
        <input id={`${ns}-business`} name="business" type="text" required autoComplete="organization" value={form.business} onChange={set('business')} placeholder="Business name" className={`${inputCls} w-full`} />

        <label htmlFor={`${ns}-concern`} className="sr-only">Your biggest concern about your website (optional)</label>
        <textarea id={`${ns}-concern`} name="concern" value={form.concern} onChange={set('concern')} placeholder="Your biggest concern about your website (optional)" rows={3} className={`${inputCls} w-full`} />

        <Turnstile key={runKey} onToken={setToken} />

        <button
          type="submit"
          disabled={phase === 'running'}
          className="w-full rounded-full bg-cyan px-[22px] py-3 text-17 text-on-accent transition hover:bg-cyan-hover active:scale-[0.97] disabled:opacity-60"
        >
          {phase === 'running' ? 'Auditing your site…' : phase === 'done' ? 'Run another audit' : 'Run my free audit'}
        </button>

        {phase === 'error' ? (
          <p className="w-full text-14 text-st-fail-fg" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <div ref={resultRef} className="scroll-mt-20">
        {phase === 'running' ? (
          <div className="mt-10 max-w-[640px] rounded-card bg-surface p-6" role="status" aria-live="polite">
            <p className="text-17 font-semibold">Auditing {form.website}. This usually takes under a minute.</p>
            <ul className="mt-4 space-y-3">
              {STEPS.map((s, i) => (
                <li key={s.step} className={`flex items-center gap-3 text-14 ${i > currentIndex ? 'text-muted' : ''}`}>
                  {i < currentIndex ? <Tick /> : i === currentIndex ? <Spinner /> : <span className="h-5 w-5 shrink-0" aria-hidden="true" />}
                  {s.label}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-12 text-muted">You can leave this page. We will email the report to {form.email} when it is done.</p>
          </div>
        ) : null}

        {phase === 'done' && report ? <AuditReportView report={report} email={form.email} /> : null}
      </div>
    </>
  );
}
