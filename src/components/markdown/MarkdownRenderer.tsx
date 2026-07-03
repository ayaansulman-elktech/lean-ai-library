import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

import { Heading } from './Heading';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
          rehypeHighlight
        ]}
        components={{
          // @ts-ignore
          h1: (props) => <Heading level={1} {...props} />,
          // @ts-ignore
          h2: (props) => <Heading level={2} {...props} />,
          // @ts-ignore
          h3: (props) => <Heading level={3} {...props} />,
          // @ts-ignore
          h4: (props) => <Heading level={4} {...props} />,
          // @ts-ignore
          h5: (props) => <Heading level={5} {...props} />,
          // @ts-ignore
          h6: (props) => <Heading level={6} {...props} />,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            return (
              <CodeBlock inline={isInline} className={className} {...props}>
                {children}
              </CodeBlock>
            );
          },
          a: ({ node, href, children, ...props }) => (
            <a href={href} className="text-primary hover:underline font-medium" {...props}>
              {children}
            </a>
          ),
          table: ({ node, children, ...props }) => (
            <div className="my-6 w-full overflow-y-auto">
              <table className="w-full text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ node, children, ...props }) => (
            <th className="border px-4 py-2 text-left font-bold bg-muted" {...props}>
              {children}
            </th>
          ),
          td: ({ node, children, ...props }) => (
            <td className="border px-4 py-2 text-left" {...props}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
