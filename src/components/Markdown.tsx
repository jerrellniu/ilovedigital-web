import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Renders a markdown/MDX body (frontmatter already stripped) with brand-styled prose.
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="max-w-[70ch] space-y-5 text-17 text-muted [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-4 [&_blockquote]:text-ink [&_code]:text-accent [&_h2]:mt-12 [&_h2]:font-heading [&_h2]:text-28 [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:font-heading [&_h3]:text-21 [&_h3]:font-semibold [&_h3]:text-ink [&_img]:my-2 [&_img]:rounded-card [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-surface [&_pre]:p-5 [&_pre]:text-14 [&_pre]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
