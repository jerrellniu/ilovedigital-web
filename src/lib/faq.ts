import type { Faq } from '@/types/content';

// Articles carry their FAQs in the Markdown body, under a "## FAQs" heading, as a bold
// question line followed by one or more answer paragraphs. This reads them back out so
// FAQPage JSON-LD is emitted from the same text the reader sees — one source of truth,
// no duplicated copy in frontmatter to drift.
//
// Expected shape:
//   ## FAQs
//   **How long does SEO take to work?**
//   Most small business sites see movement within four to twelve weeks.
//
// Any article without an FAQ section returns an empty array and emits no schema.

const FAQ_HEADING = /^#{2,3}\s*(FAQs?|Frequently asked questions)\s*$/i;
const QUESTION_LINE = /^\*\*(.+?)\*\*:?\s*$/;

/** Strip Markdown decoration so the schema carries plain text, as Google expects. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links keep their text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function extractFaqs(markdown: string): Faq[] {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => FAQ_HEADING.test(l.trim()));
  if (start === -1) return [];

  const headingLevel = (lines[start].match(/^#+/) ?? ['##'])[0].length;
  const faqs: Faq[] = [];
  let question: string | null = null;
  let answer: string[] = [];

  const flush = () => {
    if (question) {
      const text = toPlainText(answer.join('\n'));
      if (text) faqs.push({ question, answer: text });
    }
    question = null;
    answer = [];
  };

  for (const raw of lines.slice(start + 1)) {
    const line = raw.trim();
    // A heading at the same level or higher ends the FAQ section.
    const heading = line.match(/^(#+)\s/);
    if (heading && heading[1].length <= headingLevel) break;

    const q = line.match(QUESTION_LINE);
    if (q) {
      flush();
      question = toPlainText(q[1]);
      continue;
    }
    if (question && line) answer.push(line);
  }
  flush();

  return faqs;
}
