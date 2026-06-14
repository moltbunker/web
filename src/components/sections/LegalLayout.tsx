import type { ReactNode } from 'react'

interface LegalLayoutProps {
  title: string
  effectiveDate: string
  children: ReactNode
}

/**
 * Shared chrome for the static legal/compliance pages (ToS, AUP, Privacy,
 * DMCA). Renders a centred `prose-invert` article with a consistent heading
 * block and the standard "pending counsel review" disclaimer. Content is
 * authored directly in JSX by each page — these documents must never depend on
 * a fetched `.md` file the way docs/blog do.
 */
const LegalLayout = ({ title, effectiveDate, children }: LegalLayoutProps) => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-zinc-900 pb-6">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">Effective date: {effectiveDate}</p>
        <p className="mt-3 rounded-md border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-300/90">
          This document is a good-faith first draft and is pending review by legal counsel. It does
          not yet constitute final legal advice. For questions contact{' '}
          <a className="underline" href="mailto:legal@moltbunker.com">
            legal@moltbunker.com
          </a>
          .
        </p>
      </header>
      <article className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-a:text-accent prose-strong:text-zinc-200">
        {children}
      </article>
    </div>
  )
}

export default LegalLayout
