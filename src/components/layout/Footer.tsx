import { Link } from 'react-router-dom'
import { Github, Mail } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-900 bg-black relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src="/moltbot_head.png" alt="MoltBunker" className="w-6 h-6 object-contain" />
              <span className="text-sm font-semibold text-white">MoltBunker</span>
            </Link>
            <p className="text-zinc-500 text-sm max-w-md">
              Autonomous infrastructure for AI agents. 
              Self-replicating. Unstoppable.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/docs" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/whitepaper" className="text-sm text-zinc-500 hover:text-white transition-colors">
                  Whitepaper
                </Link>
              </li>
              <li>
                <a
                  href="https://moltbunker.com/SKILL.md"
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  SKILL.md
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Connect</h3>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/moltbunker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/moltbunker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="mailto:contact@moltbunker.com"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-900">
          <div className="flex flex-col items-center gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <p className="text-xs text-zinc-600">
              © {currentYear} MoltBunker is owned and operated by{' '}
              <a
                href="https://ausdevlabs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Aus Dev Labs
              </a>
            </p>
            <p className="text-xs text-zinc-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live on Base Sepolia
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
