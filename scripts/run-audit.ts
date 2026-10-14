// Run the instant audit from the terminal, without the website or email.
//
//   npx tsx scripts/run-audit.ts https://example.com.au [--no-speed] [--json]
//
// Reads ANTHROPIC_API_KEY and PAGESPEED_API_KEY from the environment when set.
// Without them the run still completes: speed is reported as not checked and the
// plan is the rules-based version.

import { runAudit } from '../src/lib/audit/run';

async function main() {
  const args = process.argv.slice(2);
  const url = args.find((a) => !a.startsWith('--'));
  if (!url) {
    console.error('Usage: npx tsx scripts/run-audit.ts <url> [--no-speed] [--json]');
    process.exit(1);
  }
  const started = Date.now();
  const report = await runAudit({
    url,
    skipSpeed: args.includes('--no-speed'),
    onEvent: (e) => e.type === 'progress' && console.error(`[${((Date.now() - started) / 1000).toFixed(1)}s] ${e.label}`),
  });

  if (args.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(`\n${report.host}  overall ${report.overall ?? '-'} / 100  (${report.pagesChecked.length} pages, ${((Date.now() - started) / 1000).toFixed(1)}s)`);
  for (const s of report.scores) console.log(`  ${s.label.padEnd(24)} ${String(s.score ?? '-').padStart(3)}  (${s.passed}/${s.total} passed)`);
  console.log(`\nSummary [${report.interpretation.source}]: ${report.interpretation.summary}\n`);
  for (const f of report.findings) {
    console.log(`${f.status.toUpperCase().padEnd(4)} ${f.priority.padEnd(8)} ${f.title}: ${f.detail}`);
  }
  console.log('\nPlan:');
  for (const m of report.interpretation.plan) {
    console.log(`  ${m.month}`);
    m.items.forEach((i) => console.log(`    - ${i}`));
  }
  if (report.notChecked.length) console.log(`\nNot checked:\n  ${report.notChecked.join('\n  ')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
