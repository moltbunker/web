import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Docs', href: '/docs' },
    { name: 'Blog', href: '/blog' },
    { name: 'Roadmap', href: '/roadmap' },
    { name: 'Whitepaper', href: '/whitepaper' },
  ]

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl">
      <nav className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/moltbot_head.png" alt="MoltBunker" className="w-6 h-6 object-contain" />
            <span className="text-sm font-semibold text-white tracking-tight">MoltBunker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'text-white bg-zinc-800'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <a
              href="https://github.com/moltbunker"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x.com/moltbunker"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              X
            </a>
            <Link
              to="/app"
              className="ml-2 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 bg-black/85 hover:bg-black/95 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all duration-300"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Launch App
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4 space-y-1"
            >
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'text-white bg-zinc-800'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <a
                href="https://github.com/moltbunker"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://x.com/moltbunker"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md transition-colors"
              >
                X
              </a>
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="block mx-3 my-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 bg-black/85 hover:bg-black/95 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all duration-300 text-center"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Launch App
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}

export default Header
