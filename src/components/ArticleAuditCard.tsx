import Button from '@/components/Button';
import type { ArticleAuditCta } from '@/types/content';

/**
 * Free audit offer placed halfway through an article (src/lib/article-split.ts).
 * A surface card inside the 70ch reading column. Copy: content/site.json
 * `articleAuditCta`.
 */
export default function ArticleAuditCard({ copy }: { copy: ArticleAuditCta }) {
  return (
    <aside aria-label={copy.heading} className="my-12 max-w-[70ch] rounded-card bg-surface p-6 md:p-8">
      {/* Not a heading: the card should not appear as a section in the article outline. */}
      <p className="font-heading text-21 font-semibold text-ink">{copy.heading}</p>
      <p className="mt-3 text-17 text-muted">{copy.body}</p>
      <div className="mt-6">
        <Button href={copy.href}>{copy.button}</Button>
      </div>
    </aside>
  );
}
