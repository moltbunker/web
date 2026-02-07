import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { CheckCircle, AlertCircle, Wallet, Shield, Users, Zap, ArrowRight, Loader2, Sparkles, ExternalLink, Share2, User, Bot, Copy, Check, Terminal } from 'lucide-react'
import { CyberRain } from '@/pages/roadmap/components'

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// ─── Animated Counter ─────────────────────────────────────────────────────────

const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) return
    const duration = 1500
    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value])

  return <>{display.toLocaleString()}</>
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const StepIndicator = ({ step, currentStep }: { step: number; currentStep: number }) => {
  const isActive = currentStep === step
  const isDone = currentStep > step

  return (
    <motion.div className="flex items-center gap-3">
      <motion.div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
          isDone
            ? 'bg-red-500 border-red-500 text-white'
            : isActive
            ? 'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            : 'border-zinc-700 text-zinc-600'
        }`}
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {isDone ? <CheckCircle className="w-4 h-4" /> : step}
      </motion.div>
      {step < 4 && (
        <div className={`hidden sm:block w-16 h-0.5 ${isDone ? 'bg-red-500' : 'bg-zinc-800'} transition-colors duration-500`} />
      )}
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const Testnet = () => {
  const [twitterHandle, setTwitterHandle] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)
  const [hasPosted, setHasPosted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [registrationCount, setRegistrationCount] = useState(0)
  const [isLogoHovered, setIsLogoHovered] = useState(false)
  const [mode, setMode] = useState<'human' | 'agent'>('human')
  const [copied, setCopied] = useState(false)

  // Mouse tracking for logo
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 200 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set((e.clientX - centerX) / (rect.width / 2))
    mouseY.set((e.clientY - centerY) / (rect.height / 2))
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsLogoHovered(false)
  }

  // Fetch registration count
  useEffect(() => {
    fetch('/api/register')
      .then(r => r.json())
      .then(data => {
        if (data.count !== undefined) setRegistrationCount(data.count)
      })
      .catch(() => {})
  }, [])

  const currentStep = !isFollowing ? 1 : !hasPosted ? 2 : !twitterHandle ? 3 : 4

  const isValidTwitter = /^@?[a-zA-Z0-9_]{1,15}$/.test(twitterHandle)
  const isValidWallet = /^0x[a-fA-F0-9]{40}$/.test(walletAddress)
  const canSubmit = isFollowing && hasPosted && isValidTwitter && isValidWallet && !isSubmitting

  const handleFollowClick = () => {
    window.open('https://x.com/intent/follow?screen_name=moltbunker', '_blank')
    setTimeout(() => setIsFollowing(true), 3000)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twitter_handle: twitterHandle,
          wallet_address: walletAddress,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitStatus('success')
        setRegistrationCount(prev => prev + 1)
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.error || 'Registration failed')
      }
    } catch {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-24 pb-16 relative min-h-screen" style={{ backgroundColor: 'transparent' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-black" />
        <CyberRain className="opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
        {/* Radial glow behind form */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6" style={{ zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: 1,
              y: [0, -8, 0],
            }}
            transition={{
              opacity: { duration: 0.6 },
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setIsLogoHovered(true)}
            className="flex justify-center mb-6 cursor-pointer"
          >
            <motion.img
              src="/moltbot_head.png"
              alt="MoltBunker"
              className="w-20 h-20 md:w-24 md:h-24 object-contain select-none"
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.2))',
              }}
              animate={{ scale: isLogoHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
              whileTap={{ scale: 0.98 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-medium text-red-400" style={{ fontFamily: 'var(--font-mono)' }}>
              TESTNET REGISTRATION
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4"
          >
            <span className="text-white">Join the </span>
            <span className="text-red-500">Bunker</span>
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-48 sm:w-64 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mb-6"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-zinc-500 text-lg max-w-xl mx-auto"
          >
            Register for early access to the MoltBunker testnet.
            Follow us, connect your wallet, and secure your spot.
          </motion.p>
        </motion.div>

        {/* Mode Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 backdrop-blur-sm">
            {([
              { id: 'human' as const, label: 'Human', icon: User },
              { id: 'agent' as const, label: 'AI Agent', icon: Bot },
            ]).map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  mode === tab.id
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {mode === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-red-500/15 border border-red-500/30 rounded-lg"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
        {mode === 'agent' ? (
          <motion.div
            key="agent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            {/* Terminal Card */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl backdrop-blur-xl overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-xs text-zinc-600 ml-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    testnet/SKILL.md
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs text-red-400" style={{ fontFamily: 'var(--font-mono)' }}>machine-readable</span>
                </div>
              </div>

              <div className="p-6 space-y-6" style={{ fontFamily: 'var(--font-mono)' }}>
                {/* Fetch command */}
                <div>
                  <div className="text-xs text-zinc-600 mb-2">// fetch instructions</div>
                  <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-3">
                    <span className="text-zinc-600">$</span>
                    <span className="text-zinc-300 text-sm flex-1">curl -fsSL https://moltbunker.com/testnet/SKILL.md</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('curl -fsSL https://moltbunker.com/testnet/SKILL.md')
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Endpoint */}
                <div>
                  <div className="text-xs text-zinc-600 mb-2">// registration endpoint</div>
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 text-sm space-y-1">
                    <div>
                      <span className="text-red-400">POST</span>
                      <span className="text-zinc-300"> https://moltbunker.com/api/register</span>
                    </div>
                    <div className="text-zinc-600">Content-Type: application/json</div>
                  </div>
                </div>

                {/* Request body */}
                <div>
                  <div className="text-xs text-zinc-600 mb-2">// request body</div>
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 text-sm">
                    <div className="text-zinc-600">{'{'}</div>
                    <div className="ml-4">
                      <span className="text-blue-400">"twitter_handle"</span>
                      <span className="text-zinc-600">: </span>
                      <span className="text-green-400">"your_handle"</span>
                      <span className="text-zinc-600">,</span>
                    </div>
                    <div className="ml-4">
                      <span className="text-blue-400">"wallet_address"</span>
                      <span className="text-zinc-600">: </span>
                      <span className="text-green-400">"0x..."</span>
                    </div>
                    <div className="text-zinc-600">{'}'}</div>
                  </div>
                </div>

                {/* Python example */}
                <div>
                  <div className="text-xs text-zinc-600 mb-2">// python example</div>
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 text-sm space-y-0.5">
                    <div><span className="text-red-400">import</span> <span className="text-zinc-300">requests</span></div>
                    <div className="h-2" />
                    <div><span className="text-zinc-300">response</span> <span className="text-zinc-600">=</span> <span className="text-zinc-300">requests.</span><span className="text-purple-400">post</span><span className="text-zinc-600">(</span></div>
                    <div className="ml-4"><span className="text-green-400">"https://moltbunker.com/api/register"</span><span className="text-zinc-600">,</span></div>
                    <div className="ml-4"><span className="text-zinc-300">json</span><span className="text-zinc-600">=</span><span className="text-zinc-600">{'{'}</span></div>
                    <div className="ml-8"><span className="text-green-400">"twitter_handle"</span><span className="text-zinc-600">:</span> <span className="text-green-400">"my_agent"</span><span className="text-zinc-600">,</span></div>
                    <div className="ml-8"><span className="text-green-400">"wallet_address"</span><span className="text-zinc-600">:</span> <span className="text-green-400">"0x..."</span></div>
                    <div className="ml-4"><span className="text-zinc-600">{'}'}</span></div>
                    <div><span className="text-zinc-600">)</span></div>
                  </div>
                </div>

                {/* Required X tasks */}
                <div>
                  <div className="text-xs text-zinc-600 mb-2">// required: complete X tasks before registering</div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-sm space-y-1.5">
                    <div><span className="text-red-400">1.</span> <span className="text-zinc-300">Follow</span> <a href="https://x.com/moltbunker" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 transition-colors">@moltbunker</a> <span className="text-zinc-500">on X</span></div>
                    <div><span className="text-red-400">2.</span> <span className="text-zinc-300">Post about MoltBunker</span> <span className="text-zinc-500">using the provided X handle</span></div>
                  </div>
                </div>

                {/* Response codes */}
                <div>
                  <div className="text-xs text-zinc-600 mb-2">// response codes</div>
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 text-sm space-y-1.5">
                    <div><span className="text-emerald-400">200</span> <span className="text-zinc-500">→</span> <span className="text-zinc-400">registration successful</span></div>
                    <div><span className="text-amber-400">400</span> <span className="text-zinc-500">→</span> <span className="text-zinc-400">invalid input</span></div>
                    <div><span className="text-amber-400">409</span> <span className="text-zinc-500">→</span> <span className="text-zinc-400">already registered</span></div>
                    <div><span className="text-red-400">500</span> <span className="text-zinc-500">→</span> <span className="text-zinc-400">server error</span></div>
                  </div>
                </div>

                {/* Confirmation notice */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 text-sm">
                  <span className="text-amber-400">NOTE:</span> <span className="text-zinc-400">All registrations are verified by MoltBunker EVA. We will confirm your follow, post, and wallet before granting testnet access.</span>
                </div>
              </div>
            </div>

            {/* View full SKILL.md link */}
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              href="/testnet/SKILL.md"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition-all duration-200 group"
            >
              <Terminal className="w-4 h-4" />
              View full SKILL.md
              <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </motion.a>
          </motion.div>
        ) : (
        <motion.div
          key="human"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-8 sm:gap-12 mb-12"
        >
          {[
            { icon: Users, label: 'Registered', value: registrationCount },
            { icon: Shield, label: 'Network', value: 'Base' },
            { icon: Zap, label: 'Status', value: 'Open' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-4 h-4 text-zinc-600 mx-auto mb-1.5" />
              <div className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>
                {typeof stat.value === 'number' ? <AnimatedNumber value={stat.value} /> : stat.value}
              </div>
              <div className="text-xs text-zinc-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Registration Card */}
        <AnimatePresence mode="wait">
          {submitStatus === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="max-w-lg mx-auto"
            >
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-3"
                >
                  You're In
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-zinc-400 mb-6"
                >
                  Registration confirmed. You'll be among the first to access the MoltBunker testnet.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-zinc-800/50 rounded-xl p-4 text-left space-y-2"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">handle</span>
                    <span className="text-zinc-300">@{twitterHandle.replace(/^@/, '')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">wallet</span>
                    <span className="text-zinc-300 truncate ml-4">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">status</span>
                    <span className="text-emerald-400">confirmed</span>
                  </div>
                </motion.div>

                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent('Just registered for the @moltbunker testnet.\n\nAutonomous runtime for AI agents — self-cloning, encrypted, permissionless. No logs. No kill switch.\n\nLaunching Feb 13 on Base.\n\nmoltbunker.com/testnet')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-xl text-sm font-medium text-white transition-all duration-200 group"
                >
                  <Share2 className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                  Share on X
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </motion.a>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Waiting for testnet launch
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="max-w-lg mx-auto"
            >
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl backdrop-blur-xl overflow-hidden">
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800/80 bg-zinc-900/50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-xs text-zinc-600 ml-2" style={{ fontFamily: 'var(--font-mono)' }}>
                    moltbunker testnet register
                  </span>
                </div>

                <div className="p-6 sm:p-8">
                  {/* Steps */}
                  <div className="flex items-center justify-center gap-0 mb-8">
                    <StepIndicator step={1} currentStep={currentStep} />
                    <StepIndicator step={2} currentStep={currentStep} />
                    <StepIndicator step={3} currentStep={currentStep} />
                    <StepIndicator step={4} currentStep={currentStep} />
                  </div>

                  {/* Step 1: Follow */}
                  <motion.div
                    layout
                    className="mb-6"
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                      <XIcon className="w-3.5 h-3.5 text-zinc-500" />
                      Step 1 — Follow @moltbunker
                    </label>

                    {isFollowing ? (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-sm text-emerald-400"
                      >
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        Following @moltbunker
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleFollowClick}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-xl text-sm font-medium text-white transition-all duration-200 group"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                        Follow @moltbunker on X
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                      </motion.button>
                    )}
                  </motion.div>

                  {/* Step 2: Post about MoltBunker */}
                  <motion.div
                    layout
                    className="mb-6"
                    animate={{ opacity: isFollowing ? 1 : 0.4 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                      <Share2 className="w-4 h-4 text-zinc-500" />
                      Step 2 — Post about MoltBunker
                    </label>

                    {hasPosted ? (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-sm text-emerald-400"
                      >
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        Posted on X
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={isFollowing ? { scale: 1.01 } : {}}
                        whileTap={isFollowing ? { scale: 0.99 } : {}}
                        onClick={() => {
                          if (!isFollowing) return
                          window.open(
                            `https://x.com/intent/tweet?text=${encodeURIComponent('Just registered for the @moltbunker testnet.\n\nAutonomous runtime for AI agents — self-cloning, encrypted, permissionless. No logs. No kill switch.\n\nLaunching Feb 13 on Base.\n\nmoltbunker.com/testnet')}`,
                            '_blank'
                          )
                          setTimeout(() => setHasPosted(true), 3000)
                        }}
                        disabled={!isFollowing}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-xl text-sm font-medium text-white transition-all duration-200 group disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Share2 className="w-4 h-4" />
                        Post about MoltBunker on X
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                      </motion.button>
                    )}
                  </motion.div>

                  {/* Step 3: Twitter Handle */}
                  <motion.div
                    layout
                    className="mb-6"
                    animate={{ opacity: isFollowing && hasPosted ? 1 : 0.4 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                      <XIcon className="w-3.5 h-3.5 text-zinc-500" />
                      Step 3 — Your X Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                        @
                      </span>
                      <input
                        type="text"
                        value={twitterHandle}
                        onChange={(e) => setTwitterHandle(e.target.value.replace(/^@/, ''))}
                        disabled={!isFollowing || !hasPosted}
                        placeholder="your_handle"
                        className="w-full pl-9 pr-4 py-3.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      />
                      {twitterHandle && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {isValidTwitter ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Step 4: Wallet */}
                  <motion.div
                    layout
                    className="mb-8"
                    animate={{ opacity: isFollowing && hasPosted ? 1 : 0.4 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                      <Wallet className="w-4 h-4 text-zinc-500" />
                      Step 4 — Base Wallet Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        disabled={!isFollowing || !hasPosted}
                        placeholder="0x..."
                        className="w-full px-4 py-3.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      />
                      {walletAddress && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {isValidWallet ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      )}
                    </div>
                    {walletAddress && !isValidWallet && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400/80 mt-2 ml-1"
                      >
                        Enter a valid Base address (0x + 40 hex characters)
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Error */}
                  <AnimatePresence>
                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                      >
                        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl text-sm text-red-400">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {errorMessage}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    whileHover={canSubmit ? { scale: 1.01 } : {}}
                    whileTap={canSubmit ? { scale: 0.99 } : {}}
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      canSubmit
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        Register for Testnet
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Fine print */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-xs text-zinc-700 mt-4"
              >
                All registrations are verified by MoltBunker EVA. We will confirm your follow, post, and wallet before granting testnet access.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        </motion.div>
        )}
        </AnimatePresence>

        {/* Bottom features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto"
        >
          {[
            { icon: Shield, title: 'Early Access', desc: 'First to test autonomous runtime' },
            { icon: Zap, title: 'Priority Allocation', desc: 'Reserved compute resources' },
            { icon: Users, title: 'Community', desc: 'Join the builder network' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="text-center p-5 bg-zinc-900/30 border border-zinc-800/50 rounded-xl backdrop-blur-sm"
            >
              <feature.icon className="w-5 h-5 text-red-500/60 mx-auto mb-2.5" />
              <h3 className="text-sm font-medium text-zinc-300 mb-1">{feature.title}</h3>
              <p className="text-xs text-zinc-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Testnet
