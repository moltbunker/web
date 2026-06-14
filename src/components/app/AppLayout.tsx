import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAccount, useSwitchChain } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Rocket, Box, Globe, Coins, Server, Settings, ShieldCheck, Loader2, AlertTriangle, Menu, X, Zap, ScanSearch, Bot, Tag } from 'lucide-react'
import WalletButton from '@/components/wallet/WalletButton'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useApi'
import { useRole } from '@/hooks/useRole'
import type { Role } from '@/hooks/useRole'
import { useAddressesReady } from '@/hooks/useContracts'
import { EDGE_UI_ENABLED } from '@/lib/features'

const REQUIRED_CHAIN_ID = baseSepolia.id // 84532

function ChainBadge() {
  const { chain } = useAccount()
  const { switchChain, isPending } = useSwitchChain()

  const isCorrectChain = chain?.id === REQUIRED_CHAIN_ID

  if (isCorrectChain) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="hidden sm:inline">Base Sepolia</span>
      </span>
    )
  }

  return (
    <button
      onClick={() => switchChain({ chainId: REQUIRED_CHAIN_ID })}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer disabled:cursor-not-allowed"
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <AlertTriangle className="w-3 h-3" />
      )}
      <span className="hidden sm:inline">
        {isPending ? 'Switching...' : `Wrong network${chain?.name ? ` (${chain.name})` : ''} — click to switch`}
      </span>
    </button>
  )
}

interface NavItem {
  to: string
  icon: typeof LayoutDashboard
  label: string
  end?: boolean
}

function getNavItems(role: Role): NavItem[] {
  return [
    { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/app/deploy', icon: Rocket, label: 'Deploy' },
    { to: '/app/containers', icon: Box, label: 'Containers' },
    { to: '/app/molts', icon: Zap, label: 'Molts' },
    { to: '/app/crawl', icon: ScanSearch, label: 'Crawl' },
    { to: '/app/agents', icon: Bot, label: 'Agents' },
    { to: '/app/registry', icon: Tag, label: 'Registry' },
    ...(EDGE_UI_ENABLED ? [{ to: '/app/edge/rules', icon: ShieldCheck, label: 'Edge' }] : []),
    { to: '/app/nodes', icon: Globe, label: 'Nodes' },
    { to: '/app/billing', icon: Coins, label: 'Billing' },
    { to: '/app/provider', icon: Server, label: role === 'provider' ? 'My Node' : 'Provider' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ]
}

export default function AppLayout() {
  const { isConnected, chain } = useAccount()
  const { isAuthenticated, authenticate } = useAuth()
  const role = useRole()
  const navItems = getNavItems(role)
  const addressesReady = useAddressesReady()
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  // Fire on any connected chain whose manifest has every contract zeroed (today
  // that is only Base Mainnet pre-cutover; LOCAL/Anvil has a non-zero token so
  // addressesReady is true there and this stays quiet). Generalising off the
  // hardcoded mainnet id means a future un-configured chain still warns instead
  // of silently no-oping every on-chain read/write.
  const showAddressesBanner = !!chain && !addressesReady && !bannerDismissed

  const handleSign = async () => {
    setSigning(true)
    setError(null)
    try {
      await authenticate()
    } catch {
      setError('Signature rejected or failed. Please try again.')
    } finally {
      setSigning(false)
    }
  }

  // State 1: Wallet not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="h-14 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl flex items-center px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/moltbot_head.png" alt="MoltBunker" className="w-6 h-6 object-contain" />
            <span className="text-sm font-semibold text-white tracking-tight">MoltBunker</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
          >
            <motion.img
              src="/moltbot_head.png"
              alt="MoltBunker"
              className="w-20 h-20 mx-auto mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.6 },
                y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              }}
              style={{ filter: 'drop-shadow(0 0 25px rgba(239, 68, 68, 0.15))' }}
            />
            <h1 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h1>
            <p className="text-zinc-400 mb-8">Connect a wallet to access the MoltBunker app.</p>
            <div className="flex justify-center">
              <WalletButton />
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // State 2: Wallet connected but not signed in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="h-14 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl flex items-center px-6">
          <Link to="/" className="flex items-center gap-2.5 mr-8">
            <img src="/moltbot_head.png" alt="MoltBunker" className="w-6 h-6 object-contain" />
            <span className="text-sm font-semibold text-white tracking-tight">MoltBunker</span>
          </Link>
          <div className="flex-1" />
          <WalletButton />
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-sm"
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <ShieldCheck className="w-8 h-8 text-red-500" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Identity</h1>
            <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
              Sign a message with your wallet to prove ownership and access the app.
              This doesn't cost any gas or send a transaction.
            </p>
            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}
            <button
              onClick={handleSign}
              disabled={signing}
              className="btn-action disabled:cursor-not-allowed"
            >
              {signing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Waiting for signature...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Sign to continue
                </>
              )}
            </button>
            <p className="text-zinc-600 text-xs mt-4">
              Check your wallet for the signature request
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // State 3: Fully authenticated
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl shrink-0">
        <div className="h-14 flex items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 mr-4 lg:mr-8 shrink-0">
            <img src="/moltbot_head.png" alt="MoltBunker" className="w-6 h-6 object-contain" />
            <span className="text-sm font-semibold text-white tracking-tight hidden sm:inline">MoltBunker</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Spacer for mobile */}
          <div className="flex-1 lg:hidden" />

          <div className="flex items-center gap-2 sm:gap-3">
            <ChainBadge />
            <WalletButton />
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors -mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-zinc-800/50 overflow-hidden"
            >
              <div className="px-3 py-2 space-y-0.5">
                {navItems.map(({ to, icon: Icon, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Contracts-not-configured banner (fires on any chain with no deployed addresses) */}
      <AnimatePresence>
        {showAddressesBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-500/10 border-b border-amber-500/30 overflow-hidden"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-400 flex-1">
                Contracts not yet configured on {chain?.name ?? 'this network'} — transactions will fail.
              </p>
              <button
                onClick={() => setBannerDismissed(true)}
                className="p-1 text-amber-400/70 hover:text-amber-300 transition-colors -mr-1"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-1">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  )
}
