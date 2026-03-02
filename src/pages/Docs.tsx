import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DocLayout from '@/components/docs/DocLayout'
import DocContent from '@/components/docs/DocContent'
import { useSEO } from '@/hooks/useSEO'

const SITE_URL = 'https://moltbunker.com'

/** Map slugs to human-readable titles for SEO. */
const DOC_TITLES: Record<string, string> = {
  'getting-started': 'Getting Started',
  installation: 'Installation',
  'quick-start': 'Quick Start',
  'runtime-power': 'Runtime Power',
  'self-cloning': 'Self-Cloning',
  security: 'Security',
  molts: 'Molts — Serverless Functions',
  'web-crawling': 'Web Crawling',
  agents: 'AI Agents',
  'python-sdk': 'Python SDK',
  'api-reference': 'API Reference',
  'base-network': 'Base Network',
  tokenomics: 'Tokenomics',
  'smart-contracts': 'Smart Contracts',
  'examples/basic-bot': 'Basic Bot Example',
  'examples/advanced-features': 'Advanced Features Example',
}

const Docs = () => {
  const location = useLocation()
  // Extract slug from pathname: "/docs/examples/basic-bot" → "examples/basic-bot"
  const slug = location.pathname.replace(/^\/docs\/?/, '') || 'getting-started'
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const docTitle = DOC_TITLES[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  useSEO({
    title: `${docTitle} - Docs`,
    description: `MoltBunker documentation: ${docTitle}. Learn how to deploy autonomous AI agents on a permissionless encrypted P2P network.`,
    canonical: `${SITE_URL}/docs/${slug}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: `${docTitle} - MoltBunker Docs`,
      description: `MoltBunker documentation: ${docTitle}.`,
      url: `${SITE_URL}/docs/${slug}`,
      publisher: {
        '@type': 'Organization',
        name: 'MoltBunker',
        url: SITE_URL,
      },
    },
  })

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/docs/${slug}.md`)
        if (response.ok) {
          const text = await response.text()
          setContent(text)
        } else {
          setContent('# Document Not Found\n\nThe requested document could not be found.')
        }
      } catch (error) {
        console.error('Error loading doc:', error)
        setContent('# Error Loading Document\n\nThere was an error loading the document.')
      } finally {
        setLoading(false)
      }
    }

    loadDoc()
  }, [slug])

  if (loading) {
    return (
      <DocLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-muted-foreground">Loading documentation...</p>
        </div>
      </DocLayout>
    )
  }

  return (
    <DocLayout>
      <DocContent content={content} />
    </DocLayout>
  )
}

export default Docs
