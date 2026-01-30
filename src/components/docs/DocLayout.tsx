import type { ReactNode } from 'react'
import DocSidebar from './DocSidebar'

interface DocLayoutProps {
  children: ReactNode
}

const DocLayout = ({ children }: DocLayoutProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <DocSidebar />
        </aside>
        <main className="lg:col-span-3">
          <article className="prose prose-invert max-w-none">
            {children}
          </article>
        </main>
      </div>
    </div>
  )
}

export default DocLayout
