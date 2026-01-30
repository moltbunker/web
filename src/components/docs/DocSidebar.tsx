import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const docSections = [
  {
    title: 'Getting Started',
    items: [
      { name: 'Introduction', href: '/docs/getting-started' },
      { name: 'Installation', href: '/docs/installation' },
      { name: 'Quick Start', href: '/docs/quick-start' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { name: 'Runtime Power', href: '/docs/runtime-power' },
      { name: 'Self-Cloning', href: '/docs/self-cloning' },
      { name: 'Security', href: '/docs/security' },
    ],
  },
  {
    title: 'Integration',
    items: [
      { name: 'Python SDK', href: '/docs/python-sdk' },
      { name: 'API Reference', href: '/docs/api-reference' },
      { name: 'Base Network', href: '/docs/base-network' },
      { name: 'Tokenomics', href: '/docs/tokenomics' },
    ],
  },
  {
    title: 'Examples',
    items: [
      { name: 'Basic Bot', href: '/docs/examples/basic-bot' },
      { name: 'Advanced Features', href: '/docs/examples/advanced-features' },
    ],
  },
]

const DocSidebar = () => {
  const location = useLocation()

  const isActive = (href: string) => location.pathname === href

  return (
    <nav className="sticky top-20 space-y-6">
      {docSections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
            {section.title}
          </h3>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-accent/20 text-accent font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span>{item.name}</span>
                  {isActive(item.href) && <ChevronRight className="w-4 h-4" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default DocSidebar
