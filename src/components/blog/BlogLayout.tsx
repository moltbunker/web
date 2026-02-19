import type { ReactNode } from 'react'
import BlogSidebar from './BlogSidebar'

interface BlogLayoutProps {
  children: ReactNode
}

const BlogLayout = ({ children }: BlogLayoutProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <BlogSidebar />
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

export default BlogLayout
