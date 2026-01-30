import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DocLayout from '@/components/docs/DocLayout'
import DocContent from '@/components/docs/DocContent'

const Docs = () => {
  const { slug = 'getting-started' } = useParams<{ slug: string }>()
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true)
      try {
        // In production, this would fetch from the docs folder
        // For now, we'll use a simple import or fetch
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
