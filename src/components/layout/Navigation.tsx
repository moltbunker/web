// Navigation component can be used for sidebar navigation in docs
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  children?: NavItem[]
}

interface NavigationProps {
  items: NavItem[]
}

const Navigation = ({ items }: NavigationProps) => {
  const location = useLocation()

  const isActive = (href: string) => location.pathname === href

  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <div key={item.name}>
          <Link
            to={item.href}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-accent/20 text-accent'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <span>{item.name}</span>
            {item.children && <ChevronRight className="w-4 h-4" />}
          </Link>
          {item.children && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.name}
                  to={child.href}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(child.href)
                      ? 'bg-accent/20 text-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Navigation
