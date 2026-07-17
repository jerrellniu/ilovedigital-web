import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Renders a markdown/MDX body (frontmatter already stripped) with brand-styled prose.
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="max-w-[70ch] space-y-5 leading-relaxed text-muted [&_a]:text-cyan [&_blockquote]:border-l-2 [&_blockquote]:border-cyan [&_blockquote]:pl-4 [&_blockquote]:text-muted [&_code]:text-cyan [&_h2]:mt-10 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:text-ink [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
