import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DocLayout from '@/components/docs/DocLayout'
import DocContent from '@/components/docs/DocContent'

const Docs = () => {
  const location = useLocation()
  // Extract slug from pathname: "/docs/examples/basic-bot" → "examples/basic-bot"
  const slug = location.pathname.replace(/^\/docs\/?/, '') || 'getting-started'
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

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
