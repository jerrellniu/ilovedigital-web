import { FAQ_HEADING } from './faq';

// Where the mid-article audit card goes. Spec: "Build Brief — Lead Source, Article
// Audit CTA and Meta Form Leads (October 2026)" in Notion, Part B.
//
// The body is split at its `## ` headings, counting only the sections before the
// FAQs, so the card can never land inside them. With four or more sections the
// card goes after the first half (rounded up); with fewer the article renders
// whole. FAQ extraction still reads the full body, so FAQPage schema is unchanged.
// Headings inside fenced code blocks are ignored.

export const MIN_SECTIONS = 4;

export function splitForAuditCard(markdown: string): { before: string; after: string } | null {
  const lines = markdown.split('\n');
  const starts: number[] = [];
  let fenced = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    if (FAQ_HEADING.test(line.trim())) break;
    if (/^##\s+\S/.test(line)) starts.push(i);
  }

  if (starts.length < MIN_SECTIONS) return null;
  const at = starts[Math.ceil(starts.length / 2)];
  return {
    before: lines.slice(0, at).join('\n').trimEnd(),
    after: lines.slice(at).join('\n'),
  };
}
