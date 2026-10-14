import type { AuditReport, Finding } from '@/lib/audit/types';

// The on-screen audit report. Styled from the design system tokens only: flat
// surface cards, 18px radius, the eight-step type scale, cyan for links and ticks.
// Status chips use the st-* tokens (globals.css), which are not yet in Claude Design.

const STATUS: Record<Finding['status'], { label: string; cls: string }> = {
  fail: { label: 'Fix now', cls: 'bg-st-fail-bg text-st-fail-fg' },
  warn: { label: 'Improve', cls: 'bg-st-warn-bg text-st-warn-fg' },
  pass: { label: 'Good', cls: 'bg-st-pass-bg text-st-pass-fg' },
  info: { label: 'Note', cls: 'bg-st-info-bg text-st-info-fg' },
};

const CATEGORY_ORDER: Finding['category'][] = ['technical', 'onpage', 'speed', 'geo'];

function Chip({ status }: { status: Finding['status'] }) {
  const s = STATUS[status];
  return <span className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-12 font-semibold ${s.cls}`}>{s.label}</span>;
}

function FindingRow({ f }: { f: Finding }) {
  return (
    <li className="border-t border-line py-5 first:border-t-0">
      <div className="flex flex-wrap items-center gap-3">
        <Chip status={f.status} />
        <h4 className="text-17 font-semibold">{f.title}</h4>
      </div>
      <p className="mt-2 text-17">{f.detail}</p>
      {f.fix ? <p className="mt-2 text-17 text-muted">{f.fix}</p> : null}
      {f.urls?.length ? (
        <details className="mt-2">
          <summary className="cursor-pointer text-14 text-accent">Show affected pages ({f.urls.length})</summary>
          <ul className="mt-2 space-y-1 break-all text-14 text-muted">
            {f.urls.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </li>
  );
}

export default function AuditReportView({ report, email }: { report: AuditReport; email: string }) {
  const byId = new Map(report.findings.map((f) => [f.id, f]));
  const problems = report.findings.filter((f) => f.status === 'fail' || f.status === 'warn');
  const passes = report.findings.filter((f) => f.status === 'pass' || f.status === 'info');
  const labels = new Map(report.scores.map((s) => [s.category, s.label]));

  return (
    <div className="mt-12" aria-live="polite">
      <p className="eyebrow">Your audit is ready</p>
      <h2 className="mt-2 text-28 md:text-40">
        {report.host}
        {report.overall !== null ? (
          <>
            {' '}
            scored <span className="text-accent">{report.overall}</span> out of 100
          </>
        ) : null}
      </h2>
      <p className="mt-3 text-14 text-muted">
        We checked {report.pagesChecked.length} pages. A copy of this report is on its way to {email}.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {report.scores.map((s) => (
          <div key={s.category} className="rounded-card bg-surface p-6">
            <div className="font-heading text-40 font-semibold leading-none">{s.score ?? '–'}</div>
            <div className="mt-2 text-14 text-muted">{s.label}</div>
            <div className="mt-1 text-12 text-muted">
              {s.total ? `${s.passed} of ${s.total} checks passed` : 'Not measured'}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-[64ch] text-21">{report.interpretation.summary}</p>

      {report.interpretation.topPriorities.length ? (
        <section className="mt-12">
          <h3 className="text-28">Fix these first</h3>
          <ol className="mt-6 space-y-4">
            {report.interpretation.topPriorities.map((t, i) => {
              const f = byId.get(t.findingId);
              if (!f) return null;
              return (
                <li key={t.findingId} className="flex gap-4 rounded-card bg-surface p-6">
                  <span className="font-heading text-28 font-semibold leading-none text-accent">{i + 1}</span>
                  <div>
                    <h4 className="text-17 font-semibold">{f.title}</h4>
                    <p className="mt-1 text-17 text-muted">{t.why}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <section className="mt-12">
        <h3 className="text-28">Your three-month plan</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {report.interpretation.plan.map((m) => (
            <div key={m.month} className="rounded-card bg-surface p-6">
              <h4 className="text-17 font-semibold">{m.month}</h4>
              <ul className="mt-3 space-y-3">
                {m.items.map((item) => (
                  <li key={item} className="text-14 text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {problems.length ? (
        <section className="mt-12">
          <h3 className="text-28">Everything we found</h3>
          {CATEGORY_ORDER.map((cat) => {
            const list = problems.filter((f) => f.category === cat);
            if (!list.length) return null;
            return (
              <div key={cat} className="mt-8">
                <h4 className="text-21">{labels.get(cat)}</h4>
                <ul className="mt-2">
                  {list.map((f) => (
                    <FindingRow key={f.id} f={f} />
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      ) : null}

      {passes.length ? (
        <details className="mt-10 rounded-card bg-surface p-6">
          <summary className="cursor-pointer text-17 font-semibold">Already working well ({passes.length})</summary>
          <ul className="mt-2">
            {passes.map((f) => (
              <FindingRow key={f.id} f={f} />
            ))}
          </ul>
        </details>
      ) : null}

      {report.notChecked.length ? (
        <section className="mt-10">
          <h3 className="text-17 font-semibold">What this audit did not cover</h3>
          <ul className="mt-2 space-y-2">
            {report.notChecked.map((n) => (
              <li key={n} className="text-14 text-muted">
                {n}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
