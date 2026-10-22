// The audit report as an email: one to the prospect, one copy to us.
//
// Sent over the same Google Workspace SMTP as notify.ts (SMTP_USER, SMTP_PASSWORD,
// NOTIFY_TO). Email clients ignore stylesheets, so every style is inline and the
// layout is tables. Everything that came from the audited site (titles, URLs) or
// the visitor (name, business) is escaped: a page title is untrusted input.
//
// Status colours are not in the design system yet. These pairs differ in lightness
// as well as hue and each text colour clears 4.5:1 on its background.

import nodemailer from 'nodemailer';
import type { AuditReport, Finding } from './types';
import { getSite } from '../content';

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const C = {
  ink: '#1D1D1F',
  muted: '#6E6E73',
  line: '#D2D2D7',
  surface: '#F5F5F7',
  accent: '#127A88',
  fill: '#1CBFD4',
  onFill: '#06222A',
};

export const STATUS_STYLE: Record<Finding['status'], { label: string; fg: string; bg: string }> = {
  fail: { label: 'Fix now', fg: '#A3261A', bg: '#FDECEA' },
  warn: { label: 'Improve', fg: '#7A4E00', bg: '#FFF4DB' },
  pass: { label: 'Good', fg: '#0E6672', bg: '#E3F6F8' },
  info: { label: 'Note', fg: '#4A4A4F', bg: '#EDEDF0' },
};

const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

function chip(status: Finding['status']) {
  const s = STATUS_STYLE[status];
  return `<span style="display:inline-block;padding:2px 10px;border-radius:12px;background:${s.bg};color:${s.fg};font-size:12px;font-weight:600;">${s.label}</span>`;
}

function findingBlock(f: Finding) {
  return `<tr><td style="padding:16px 0;border-top:1px solid ${C.line};">
    <div style="margin-bottom:6px;">${chip(f.status)} <span style="font-size:17px;font-weight:600;color:${C.ink};">&nbsp;${esc(f.title)}</span></div>
    <div style="font-size:15px;line-height:22px;color:${C.ink};">${esc(f.detail)}</div>
    ${f.fix ? `<div style="font-size:15px;line-height:22px;color:${C.muted};margin-top:6px;">${esc(f.fix)}</div>` : ''}
    ${f.urls?.length ? `<div style="font-size:13px;line-height:20px;color:${C.muted};margin-top:6px;word-break:break-all;">${f.urls.map(esc).join('<br>')}</div>` : ''}
  </td></tr>`;
}

export function renderReportHtml(report: AuditReport, name: string | null, opts: { internal?: string } = {}) {
  const site = getSite();
  const booking = site.schedules.discovery15.href;
  const first = name?.trim().split(/\s+/)[0];
  const problems = report.findings.filter((f) => f.status === 'fail' || f.status === 'warn');
  const passes = report.findings.filter((f) => f.status === 'pass');
  const byId = new Map(report.findings.map((f) => [f.id, f]));

  const scores = report.scores
    .map(
      (s) => `<td align="center" style="padding:12px 6px;background:${C.surface};border-radius:12px;">
        <div style="font-size:28px;font-weight:600;color:${C.ink};">${s.score ?? '&ndash;'}</div>
        <div style="font-size:12px;color:${C.muted};">${esc(s.label)}</div></td>`,
    )
    .join('<td width="8"></td>');

  const top = report.interpretation.topPriorities
    .map((t, i) => {
      const f = byId.get(t.findingId);
      return f
        ? `<tr><td style="padding:8px 0;font-size:15px;line-height:22px;color:${C.ink};"><strong>${i + 1}. ${esc(f.title)}.</strong> ${esc(t.why)}</td></tr>`
        : '';
    })
    .join('');

  const plan = report.interpretation.plan
    .map(
      (m) => `<tr><td style="padding:12px 0 4px;font-size:17px;font-weight:600;color:${C.ink};">${esc(m.month)}</td></tr>
      ${m.items.map((i) => `<tr><td style="padding:3px 0 3px 14px;font-size:15px;line-height:22px;color:${C.ink};">&bull;&nbsp; ${esc(i)}</td></tr>`).join('')}`,
    )
    .join('');

  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Website audit for ${esc(report.host)}</title></head>
<body style="margin:0;padding:0;background:#FFFFFF;font-family:${FONT};color:${C.ink};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">
${opts.internal ? `<tr><td style="padding:12px 16px;background:${C.surface};border-radius:12px;font-size:14px;line-height:21px;color:${C.ink};">${opts.internal}</td></tr><tr><td height="16"></td></tr>` : ''}
<tr><td style="font-size:14px;color:${C.accent};font-weight:600;">I Love Digital &middot; Free website audit</td></tr>
<tr><td style="padding:8px 0 4px;font-size:28px;line-height:34px;font-weight:600;color:${C.ink};">${esc(report.host)}${report.overall !== null ? ` scored ${report.overall} out of 100` : ''}</td></tr>
<tr><td style="padding:0 0 16px;font-size:14px;color:${C.muted};">We checked ${report.pagesChecked.length} pages on ${new Date(report.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Brisbane' })}.</td></tr>
<tr><td style="font-size:17px;line-height:25px;color:${C.ink};padding-bottom:20px;">${first ? `Hi ${esc(first)}, here` : 'Here'} is your audit. ${esc(report.interpretation.summary)}</td></tr>
<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${scores}</tr></table></td></tr>
${top ? `<tr><td style="padding:28px 0 4px;font-size:21px;font-weight:600;color:${C.ink};">Fix these first</td></tr>${top}` : ''}
<tr><td style="padding:28px 0 4px;font-size:21px;font-weight:600;color:${C.ink};">Your three-month plan</td></tr>
${plan}
${problems.length ? `<tr><td style="padding:28px 0 4px;font-size:21px;font-weight:600;color:${C.ink};">Everything we found</td></tr>${problems.map(findingBlock).join('')}` : ''}
${passes.length ? `<tr><td style="padding:20px 0 4px;font-size:17px;font-weight:600;color:${C.ink};">Already working well</td></tr><tr><td style="font-size:15px;line-height:22px;color:${C.muted};">${passes.map((p) => esc(p.title)).join(', ')}.</td></tr>` : ''}
${report.notChecked.length ? `<tr><td style="padding:20px 0 4px;font-size:17px;font-weight:600;color:${C.ink};">What this audit did not cover</td></tr>${report.notChecked.map((n) => `<tr><td style="padding:3px 0;font-size:14px;line-height:21px;color:${C.muted};">${esc(n)}</td></tr>`).join('')}` : ''}
<tr><td style="padding:32px 0 8px;font-size:17px;line-height:25px;color:${C.ink};">Want a hand with any of this? Book a free 15-minute call and we will go through your report together. No pitch, no obligation.</td></tr>
<tr><td style="padding:8px 0 24px;"><a href="${esc(booking)}" style="display:inline-block;padding:12px 22px;border-radius:980px;background:${C.fill};color:${C.onFill};font-size:17px;text-decoration:none;">Book a 15-minute call</a></td></tr>
<tr><td style="padding-top:16px;border-top:1px solid ${C.line};font-size:13px;line-height:20px;color:${C.muted};">I Love Digital &middot; Gold Coast, Queensland &middot; ${esc(site.phone)} &middot; <a href="https://ilovedigital.com.au" style="color:${C.accent};">ilovedigital.com.au</a><br>You received this because you requested a free audit of ${esc(report.host)} at ilovedigital.com.au. Reply to this email if you have any questions.</td></tr>
</table></td></tr></table></body></html>`;
}

export function renderReportText(report: AuditReport, name: string | null) {
  const site = getSite();
  const first = name?.trim().split(/\s+/)[0];
  const byId = new Map(report.findings.map((f) => [f.id, f]));
  const lines = [
    `${first ? `Hi ${first}, here` : 'Here'} is your website audit for ${report.host}.`,
    report.overall !== null ? `Overall score: ${report.overall} out of 100 (${report.pagesChecked.length} pages checked).` : '',
    '',
    report.interpretation.summary,
    '',
    ...report.scores.map((s) => `${s.label}: ${s.score ?? 'not measured'}`),
    '',
    'FIX THESE FIRST',
    ...report.interpretation.topPriorities.map((t, i) => `${i + 1}. ${byId.get(t.findingId)?.title ?? ''}. ${t.why}`),
    '',
    'YOUR THREE-MONTH PLAN',
    ...report.interpretation.plan.flatMap((m) => [m.month, ...m.items.map((i) => `  - ${i}`)]),
    '',
    'EVERYTHING WE FOUND',
    ...report.findings
      .filter((f) => f.status === 'fail' || f.status === 'warn')
      .flatMap((f) => [`[${STATUS_STYLE[f.status].label}] ${f.title}`, `  ${f.detail}`, f.fix ? `  ${f.fix}` : '', ...(f.urls || []).map((u) => `  ${u}`)]),
    '',
    `Book a free 15-minute call: ${site.schedules.discovery15.href}`,
    `I Love Digital, Gold Coast. ${site.phone}. ilovedigital.com.au`,
  ];
  return lines.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
}

function transport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) return null;
  return { user, t: nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass } }) };
}

export interface Lead {
  email: string;
  name: string | null;
  business: string | null;
  concern: string | null;
  /** Headline on the internal copy. Defaults to "New instant audit lead". */
  label?: string;
  /** Extra lines on the internal copy, keyed as they should read (e.g. Source, Phone). */
  extra?: Record<string, string>;
}

const lineKey = (k: string) => `${k[0].toUpperCase()}${k.slice(1)}`;

/** Send the report to the prospect and a copy to us. Never throws; returns what was sent. */
export async function sendReportEmails(report: AuditReport, lead: Lead): Promise<{ prospect: boolean; internal: boolean }> {
  const tx = transport();
  if (!tx) {
    console.error('[audit] SMTP_USER or SMTP_PASSWORD is not set — report not emailed:', { email: lead.email, host: report.host });
    return { prospect: false, internal: false };
  }
  const ours = process.env.NOTIFY_TO || tx.user;
  const result = { prospect: false, internal: false };

  try {
    await tx.t.sendMail({
      from: `"I Love Digital" <${tx.user}>`,
      to: lead.email,
      replyTo: ours,
      subject: `Your website audit for ${report.host}`,
      html: renderReportHtml(report, lead.name),
      text: renderReportText(report, lead.name),
    });
    result.prospect = true;
  } catch (e) {
    console.error('[audit] prospect email failed:', e);
  }

  const banner = [
    `<strong>${esc(lead.label || 'New instant audit lead')}.</strong> ${result.prospect ? 'The report below was emailed to them.' : '<strong>The report did NOT reach them</strong> (send failed) — follow up by hand.'}`,
    `Name: ${esc(lead.name || '-')}`,
    `Business: ${esc(lead.business || '-')}`,
    `Email: ${esc(lead.email)}`,
    `Website: ${esc(report.finalUrl)}`,
    lead.concern ? `Their concern: ${esc(lead.concern)}` : '',
    ...Object.entries(lead.extra ?? {}).map(([k, v]) => `${esc(lineKey(k))}: ${esc(v)}`),
    `Plan written by: ${report.interpretation.source === 'model' ? 'Claude (passed the figures check)' : 'rules (Claude unavailable or failed a guard)'}`,
  ]
    .filter(Boolean)
    .join('<br>');

  try {
    await tx.t.sendMail({
      from: `"I Love Digital website" <${tx.user}>`,
      to: ours,
      replyTo: lead.email,
      subject: `Instant audit: ${report.host} scored ${report.overall ?? '-'} — ${lead.email}`,
      html: renderReportHtml(report, lead.name, { internal: banner }),
      text: [
        lead.label || 'New instant audit lead',
        `Name: ${lead.name || '-'}`,
        `Business: ${lead.business || '-'}`,
        `Email: ${lead.email}`,
        ...Object.entries(lead.extra ?? {}).map(([k, v]) => `${lineKey(k)}: ${v}`),
        '',
        renderReportText(report, lead.name),
      ].join('\n'),
    });
    result.internal = true;
  } catch (e) {
    console.error('[audit] internal copy failed:', e);
  }
  return result;
}
