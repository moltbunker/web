import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogType?: 'website' | 'article'
  ogImage?: string
  article?: {
    publishedTime: string
    tags: string[]
    author?: string
  }
  jsonLd?: Record<string, unknown>
}

const SITE_NAME = 'MoltBunker'
const DEFAULT_TITLE = 'MoltBunker - Runtime Environment for AI Bots'
const DEFAULT_DESCRIPTION =
  'Permissionless, high-availability, unstoppable bunker for AI Bots. If bots have feelings, they deserve protection.'
const SITE_URL = 'https://moltbunker.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/moltbot_head.png`

function setMeta(property: string, content: string, isName = false) {
  const attr = isName ? 'name' : 'property'
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(data: Record<string, unknown>) {
  let el = document.head.querySelector<HTMLScriptElement>('script[data-seo-jsonld]')
  if (!el) {
    el = document.createElement('script')
    el.setAttribute('type', 'application/ld+json')
    el.setAttribute('data-seo-jsonld', 'true')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function removeJsonLd() {
  const el = document.head.querySelector('script[data-seo-jsonld]')
  if (el) el.remove()
}

export function useSEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  article,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE
    const desc = description || DEFAULT_DESCRIPTION
    const url = canonical || `${SITE_URL}${window.location.pathname}`
    const image = ogImage || DEFAULT_OG_IMAGE

    document.title = fullTitle

    // Canonical URL
    setCanonical(url)

    // Standard meta
    setMeta('description', desc, true)

    // Open Graph
    setMeta('og:title', fullTitle)
    setMeta('og:description', desc)
    setMeta('og:type', ogType)
    setMeta('og:url', url)
    setMeta('og:image', image)
    setMeta('og:site_name', SITE_NAME)

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image', true)
    setMeta('twitter:site', '@moltbunker', true)
    setMeta('twitter:title', fullTitle, true)
    setMeta('twitter:description', desc, true)
    setMeta('twitter:image', image, true)

    // Article-specific OG tags
    if (article) {
      setMeta('article:published_time', article.publishedTime)
      if (article.author) {
        setMeta('article:author', article.author)
      }
      article.tags.forEach((tag, i) => {
        setMeta(`article:tag:${i}`, tag)
      })
    }

    // JSON-LD
    if (jsonLd) {
      setJsonLd(jsonLd)
    }

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = DEFAULT_TITLE
      setMeta('description', DEFAULT_DESCRIPTION, true)
      setMeta('og:title', DEFAULT_TITLE)
      setMeta('og:description', DEFAULT_DESCRIPTION)
      setMeta('og:type', 'website')
      setMeta('og:url', SITE_URL)
      setMeta('og:image', DEFAULT_OG_IMAGE)
      setMeta('twitter:title', DEFAULT_TITLE, true)
      setMeta('twitter:description', DEFAULT_DESCRIPTION, true)
      setCanonical(SITE_URL)
      removeJsonLd()
    }
  }, [title, description, canonical, ogType, ogImage, article, jsonLd])
}
