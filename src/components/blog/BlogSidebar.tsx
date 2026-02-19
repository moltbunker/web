import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { blogPosts } from './blogPosts'

const BlogSidebar = () => {
  const location = useLocation()
  const currentSlug = location.pathname.replace(/^\/blog\/?/, '')

  return (
    <nav className="sticky top-20 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
          Posts
        </h3>
        <ul className="space-y-1">
          {blogPosts.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentSlug === post.slug
                    ? 'bg-accent/20 text-accent font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span className="line-clamp-2">{post.title}</span>
                {currentSlug === post.slug && <ChevronRight className="w-4 h-4 shrink-0 ml-2" />}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
          Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(blogPosts.flatMap((p) => p.tags))).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default BlogSidebar
