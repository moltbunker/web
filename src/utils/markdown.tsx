import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

export const renderMarkdown = (content: string) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: ReactNode }) => {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <pre className="bg-black rounded-lg p-4 overflow-x-auto my-4 border border-zinc-800">
              <code className={`${className} text-sm font-mono`} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code className="bg-zinc-900 text-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono border border-zinc-800" {...props}>
              {children}
            </code>
          )
        },
        h1: ({ children }: { children?: ReactNode }) => (
          <h1 className="text-4xl font-bold text-foreground mt-8 mb-4">{children}</h1>
        ),
        h2: ({ children }: { children?: ReactNode }) => (
          <h2 className="text-3xl font-bold text-foreground mt-8 mb-4">{children}</h2>
        ),
        h3: ({ children }: { children?: ReactNode }) => (
          <h3 className="text-2xl font-semibold text-foreground mt-6 mb-3">{children}</h3>
        ),
        p: ({ children }: { children?: ReactNode }) => (
          <p className="text-muted-foreground mb-4 leading-relaxed">{children}</p>
        ),
        ul: ({ children }: { children?: ReactNode }) => (
          <ul className="list-disc list-inside mb-4 space-y-2 text-muted-foreground">{children}</ul>
        ),
        ol: ({ children }: { children?: ReactNode }) => (
          <ol className="list-decimal list-inside mb-4 space-y-2 text-muted-foreground">{children}</ol>
        ),
        li: ({ children }: { children?: ReactNode }) => <li className="ml-4">{children}</li>,
        a: ({ href, children }: { href?: string; children?: ReactNode }) => (
          <a
            href={href}
            className="text-accent hover:text-accent-dark underline"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        ),
        blockquote: ({ children }: { children?: ReactNode }) => (
          <blockquote className="border-l-4 border-accent pl-4 italic my-4 text-muted-foreground">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
