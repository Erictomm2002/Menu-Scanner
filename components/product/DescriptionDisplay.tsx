import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DescriptionDisplayProps {
  markdown: string;
  className?: string;
}

/**
 * Component to display markdown-formatted product descriptions.
 * Supports:
 * - Bold: **text**
 * - Italic: *text*
 * - Headers: ## Text
 * - Bullet lists: - item or * item
 * - Numbered lists: 1. item
 * - Links: [text](url)
 * - Line breaks: Use double space or \n
 */
export function DescriptionDisplay({ markdown, className = '' }: DescriptionDisplayProps) {
  if (!markdown || markdown.trim() === '') {
    return <span className={className}>-</span>;
  }

  return (
    <div className={`prose prose-sm prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize heading styles
          h1: ({ children }) => <h1 className="text-base font-bold text-slate-900 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold text-slate-800 mb-1 mt-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-700 mb-1 mt-1">{children}</h3>,
          h4: ({ children }) => <h4 className="text-xs font-semibold text-slate-600 mb-1">{children}</h4>,
          // Customize paragraph
          p: ({ children }) => <p className="text-sm text-slate-600 mb-1 leading-relaxed">{children}</p>,
          // Customize lists
          ul: ({ children }) => <ul className="list-disc list-inside text-sm text-slate-600 mb-2 pl-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside text-sm text-slate-600 mb-2 pl-1">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5 leading-relaxed">{children}</li>,
          // Customize emphasis
          strong: ({ children }) => <strong className="font-bold text-slate-800">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
          // Customize links
          a: ({ children, href }) => (
            <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          // Customize code
          code: ({ children }) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-slate-700">{children}</code>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
