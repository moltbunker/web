import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import type { BlogPost } from './blogPosts'

interface BlogCardProps {
  post: BlogPost
  index: number
}

const BlogCard = ({ post, index }: BlogCardProps) => {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group block rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition-all duration-300 hover:border-red-500/30 hover:bg-zinc-900/50"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 text-xs rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 group-hover:border-zinc-700"
            >
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
          {post.title}
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-zinc-500 group-hover:text-red-400 transition-colors">
            Read
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

export default BlogCard
