import { useLocation } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import BlogLayout from '@/components/blog/BlogLayout'
import BlogCard from '@/components/blog/BlogCard'
import DocContent from '@/components/docs/DocContent'
import { blogPosts } from '@/components/blog/blogPosts'
import { useSEO } from '@/hooks/useSEO'

const SITE_URL = 'https://moltbunker.com'

const BlogIndex = () => {
  useSEO({
    title: 'Blog',
    description:
      'Thoughts on decentralized infrastructure, confidential computing, and the future of the permissionless web.',
    canonical: `${SITE_URL}/blog`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'MoltBunker Blog',
      description:
        'Thoughts on decentralized infrastructure, confidential computing, and the future of the permissionless web.',
      url: `${SITE_URL}/blog`,
      publisher: {
        '@type': 'Organization',
        name: 'MoltBunker',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/moltbot_head.png`,
        },
      },
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Thoughts on decentralized infrastructure, confidential computing, and the future of the
          permissionless web.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogPosts.map((post, i) => (
          <BlogCard key={post.slug} post={post} index={i} />
        ))}
      </div>
    </div>
  )
}

const BlogPost = ({ slug }: { slug: string }) => {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const post = blogPosts.find((p) => p.slug === slug)

  const jsonLd = useMemo(() => {
    if (!post) return undefined
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      url: `${SITE_URL}/blog/${post.slug}`,
      keywords: post.tags.join(', '),
      author: {
        '@type': 'Organization',
        name: 'MoltBunker',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: 'MoltBunker',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/moltbot_head.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${post.slug}`,
      },
      image: `${SITE_URL}/moltbot_head.png`,
    }
  }, [post])

  useSEO({
    title: post?.title,
    description: post?.excerpt,
    canonical: post ? `${SITE_URL}/blog/${post.slug}` : undefined,
    ogType: 'article',
    article: post
      ? {
          publishedTime: post.date,
          tags: post.tags,
          author: 'MoltBunker',
        }
      : undefined,
    jsonLd,
  })

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/blog/${slug}.md`)
        if (response.ok) {
          const text = await response.text()
          setContent(text)
        } else {
          setContent('# Post Not Found\n\nThe requested blog post could not be found.')
        }
      } catch (error) {
        console.error('Error loading blog post:', error)
        setContent('# Error Loading Post\n\nThere was an error loading the blog post.')
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [slug])

  if (loading) {
    return (
      <BlogLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          <p className="mt-4 text-muted-foreground">Loading post...</p>
        </div>
      </BlogLayout>
    )
  }

  return (
    <BlogLayout>
      {post && (
        <header className="mb-8 pb-6 border-b border-zinc-800">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800"
              >
                {tag}
              </span>
            ))}
          </div>
          <time dateTime={post.date} className="text-sm text-zinc-500">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span className="text-sm text-zinc-600 mx-2">/</span>
          <span className="text-sm text-zinc-500">{post.readingTime}</span>
        </header>
      )}
      <DocContent content={content} />
    </BlogLayout>
  )
}

const Blog = () => {
  const location = useLocation()
  const slug = location.pathname.replace(/^\/blog\/?/, '')

  if (!slug) {
    return <BlogIndex />
  }

  return <BlogPost slug={slug} />
}

export default Blog
