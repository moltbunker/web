import { useEffect, useState } from 'react'
import DocContent from '@/components/docs/DocContent'
import { useSEO } from '@/hooks/useSEO'

const SITE_URL = 'https://moltbunker.com'

const WhitepaperPage = () => {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useSEO({
    title: 'Whitepaper',
    description:
      'MoltBunker technical whitepaper. Architecture, threat model, staking economics, and the design of a permissionless encrypted runtime for autonomous AI agents.',
    canonical: `${SITE_URL}/whitepaper`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'MoltBunker Whitepaper',
      description:
        'Technical whitepaper covering architecture, threat model, staking economics, and permissionless encrypted runtime design.',
      url: `${SITE_URL}/whitepaper`,
      publisher: {
        '@type': 'Organization',
        name: 'MoltBunker',
        url: SITE_URL,
      },
    },
  })

  useEffect(() => {
    const loadWhitepaper = async () => {
      setLoading(true)
      try {
        const response = await fetch('/whitepaper/moltbunker-whitepaper.md')
        if (response.ok) {
          const text = await response.text()
          setContent(text)
        } else {
          setContent('# Whitepaper Not Found\n\nThe whitepaper could not be loaded.')
        }
      } catch (error) {
        console.error('Error loading whitepaper:', error)
        setContent('# Error Loading Whitepaper\n\nThere was an error loading the whitepaper.')
      } finally {
        setLoading(false)
      }
    }

    loadWhitepaper()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-muted-foreground">Loading whitepaper...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="prose prose-invert max-w-none">
        <DocContent content={content} />
      </article>
    </div>
  )
}

export default WhitepaperPage
