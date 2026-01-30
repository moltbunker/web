import { useEffect, useState } from 'react'
import DocContent from '@/components/docs/DocContent'

const WhitepaperPage = () => {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

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
