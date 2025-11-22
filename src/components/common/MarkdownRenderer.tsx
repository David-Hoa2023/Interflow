import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useConfigStore } from '../../store/configStore';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const { theme } = useConfigStore();

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom code block renderer with syntax highlighting
          code(props: any) {
            const { node, inline, className, children, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            return !inline && language ? (
              <div className="my-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  {language}
                </div>
                <SyntaxHighlighter
                  style={theme === 'dark' ? vscDarkPlus : vs}
                  language={language}
                  PreTag="div"
                  {...rest}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono"
                {...rest}
              >
                {children}
              </code>
            );
          },

          // Custom image renderer with lazy loading
          img(props: any) {
            const { src, alt, ...rest } = props;
            return (
              <div className="my-3">
                <img
                  src={src}
                  alt={alt || 'Image'}
                  loading="lazy"
                  className="max-w-full rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                  {...rest}
                />
                {alt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center italic">
                    {alt}
                  </p>
                )}
              </div>
            );
          },

          // Custom link renderer with external link indicator
          a(props: any) {
            const { href, children, ...rest } = props;
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                {...rest}
              >
                {children}
                {isExternal && (
                  <span className="inline-block ml-1 text-xs">↗</span>
                )}
              </a>
            );
          },

          // Headings with proper styling
          h1: (props: any) => (
            <h1 className="text-2xl font-bold mb-3 mt-4 text-gray-900 dark:text-white">
              {props.children}
            </h1>
          ),
          h2: (props: any) => (
            <h2 className="text-xl font-bold mb-2 mt-3 text-gray-900 dark:text-white">
              {props.children}
            </h2>
          ),
          h3: (props: any) => (
            <h3 className="text-lg font-semibold mb-2 mt-3 text-gray-900 dark:text-white">
              {props.children}
            </h3>
          ),

          // Lists with proper spacing
          ul: (props: any) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-gray-800 dark:text-gray-200">
              {props.children}
            </ul>
          ),
          ol: (props: any) => (
            <ol className="list-decimal list-inside space-y-1 my-2 text-gray-800 dark:text-gray-200">
              {props.children}
            </ol>
          ),

          // Blockquotes
          blockquote: (props: any) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 italic text-gray-700 dark:text-gray-300">
              {props.children}
            </blockquote>
          ),

          // Tables with styling
          table: (props: any) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                {props.children}
              </table>
            </div>
          ),
          thead: (props: any) => (
            <thead className="bg-gray-50 dark:bg-gray-700">{props.children}</thead>
          ),
          th: (props: any) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {props.children}
            </th>
          ),
          td: (props: any) => (
            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700">
              {props.children}
            </td>
          ),

          // Paragraphs
          p: (props: any) => (
            <p className="mb-2 text-gray-800 dark:text-gray-200">{props.children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
