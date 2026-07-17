// Shared layout for /terms and /privacy. Migrate the existing policy copy into the
// `body` children; this component only sets the readable legal-page layout.
import type { ReactNode } from 'react';

export default function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <section className="container-wide section-y">
      <div className="mx-auto max-w-[70ch]">
        <h1 className="text-[clamp(2rem,4vw,3rem)]">{title}</h1>
        <p className="mt-3 text-[0.9rem] text-faint">Last updated: {lastUpdated}</p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
