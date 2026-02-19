import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { FileCode, Zap, Coins, Lock, Wallet, DollarSign, Users, Star, Cpu, Clock } from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'
import {
  CyberRain,
  CountdownBlock,
  Separator,
  ContractCard,
  FeaturesSection,
  SecuritySection,
  CLISection,
  StatusSection,
  Timeline,
  SDKSection,
} from './components'

const LAUNCH_DATE = new Date('2026-02-14T08:00:00Z') // End of Feb 13 PST

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const calculateTimeLeft = (): TimeLeft => {
  const difference = LAUNCH_DATE.getTime() - new Date().getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

const SITE_URL = 'https://moltbunker.com'

const Roadmap = () => {
  useSEO({
    title: 'Roadmap',
    description:
      'MoltBunker development roadmap. Testnet live on Base Sepolia with 8 verified smart contracts. Track milestones, contract addresses, and launch progress.',
    canonical: `${SITE_URL}/roadmap`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'MoltBunker Roadmap',
      description:
        'Development roadmap and testnet status for MoltBunker autonomous AI agent runtime.',
      url: `${SITE_URL}/roadmap`,
      isPartOf: {
        '@type': 'WebSite',
        url: SITE_URL,
        name: 'MoltBunker',
      },
    },
  })

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())
  const [prevTimeLeft, setPrevTimeLeft] = useState<TimeLeft>(calculateTimeLeft())
  const [isLaunched, setIsLaunched] = useState(() => LAUNCH_DATE.getTime() <= Date.now())
  const [isLogoHovered, setIsLogoHovered] = useState(false)

  // Mouse tracking for logo animation
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

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevTimeLeft(timeLeft)
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 &&
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsLaunched(true)
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  return (
    <div className="pt-24 pb-16 relative" style={{ backgroundColor: 'transparent' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-black" />
        <CyberRain />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6" style={{ zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: 1,
              y: [0, -8, 0],
            }}
            transition={{
              opacity: { duration: 0.6 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setIsLogoHovered(true)}
            className="flex justify-center mb-6 cursor-pointer"
          >
            <motion.img
              src="/moltbot_head.png"
              alt="MoltBunker"
              className="w-24 h-24 md:w-28 md:h-28 object-contain select-none"
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                filter: "drop-shadow(0 0 20px rgba(127, 29, 29, 0.15))",
              }}
              animate={{ scale: isLogoHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
              whileTap={{ scale: 0.98 }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4"
          >
            <span className="text-white">Molt</span>
            <span className="text-red-500 ml-3">
              Bunker
            </span>
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-48 sm:w-64 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mb-6"
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-medium mb-4 tracking-tight text-zinc-500">
              Autonomous Infrastructure for AI Agents
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm mt-4" style={{ fontFamily: 'var(--font-mono)' }}>
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                No logs
              </span>
              <span className="text-zinc-700">|</span>
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                No kill switch
              </span>
              <span className="text-zinc-700">|</span>
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Permissionless
              </span>
              <span className="text-zinc-700">|</span>
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Encrypted
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Countdown */}
        {!isLaunched ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-16 sm:mb-20"
          >
            <div className="flex justify-center items-start gap-2 sm:gap-4 md:gap-6">
              <CountdownBlock value={timeLeft.days} prevValue={prevTimeLeft.days} label="Days" />
              <Separator />
              <CountdownBlock value={timeLeft.hours} prevValue={prevTimeLeft.hours} label="Hours" />
              <Separator />
              <CountdownBlock value={timeLeft.minutes} prevValue={prevTimeLeft.minutes} label="Min" />
              <Separator />
              <CountdownBlock value={timeLeft.seconds} prevValue={prevTimeLeft.seconds} label="Sec" />
            </div>

            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center text-red-500/60 mt-8 text-sm"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              ● LIVE IN {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-20"
          >
            <Link to="/docs/smart-contracts">
              <motion.div
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.15)',
                  borderColor: 'rgba(16, 185, 129, 0.6)',
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Zap className="w-5 h-5 text-emerald-400" />
                </motion.div>
                <span className="text-lg font-semibold text-emerald-400" style={{ fontFamily: 'var(--font-mono)' }}>TESTNET LIVE</span>
                <motion.span
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </Link>
            <p className="mt-3 text-sm text-zinc-400" style={{ fontFamily: 'var(--font-mono)' }}>
              Base Sepolia &middot; Chain ID 84532 &middot; 8 contracts deployed &amp; verified
            </p>
          </motion.div>
        )}

        {/* Implementation Status */}
        <StatusSection />

        {/* Timeline */}
        <Timeline />

        {/* Features Section */}
        <FeaturesSection />

        {/* Security Section */}
        <SecuritySection />

        {/* CLI Reference */}
        <CLISection />

        {/* SDK Preview */}
        <SDKSection />

        {/* Contracts */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-4 mb-12"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-zinc-400" />
            Contract Addresses — Base Sepolia
          </h2>

          <div className="grid gap-4">
            <ContractCard
              title="BunkerToken"
              address="0x4cc3F5C0d2Ecb4118e214980906eFe5c880a6ceA"
              status="live"
              icon={Coins}
              network="sepolia"
            />
            <ContractCard
              title="BunkerStaking"
              address="0xDC76d972a827D2a19867EF9aBD335014d5Cf7D6a"
              status="live"
              icon={Lock}
              network="sepolia"
            />
            <ContractCard
              title="BunkerEscrow"
              address="0xBAdaB53a9E98D904E3dfcDb728D510c69DAeE9B4"
              status="live"
              icon={Wallet}
              network="sepolia"
            />
            <ContractCard
              title="BunkerPricing"
              address="0x5A61b05F289344202433ccDf44aFc611d9E3dA47"
              status="live"
              icon={DollarSign}
              network="sepolia"
            />
            <ContractCard
              title="BunkerDelegation"
              address="0x071252B4f4bC80cccEccDe1A644229EE2dAf09F5"
              status="live"
              icon={Users}
              network="sepolia"
            />
            <ContractCard
              title="BunkerReputation"
              address="0x55721fC66B30Fe26a0820CfDeffC0815135678Ed"
              status="live"
              icon={Star}
              network="sepolia"
            />
            <ContractCard
              title="BunkerVerification"
              address="0x9aA9Fc961da51dcFfF0232883631f7147CaBFBCD"
              status="live"
              icon={Cpu}
              network="sepolia"
            />
            <ContractCard
              title="BunkerTimelock"
              address="0xcD8af28808749CD4B55a970f14DA250C8EAEd3C9"
              status="live"
              icon={Clock}
              network="sepolia"
            />
          </div>
        </motion.div>

        {/* Network Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 mb-12"
        >
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Network Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Testnet</span>
              <span className="text-emerald-400 font-medium">Base Sepolia</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Chain ID</span>
              <span className="text-white font-medium" style={{ fontFamily: 'var(--font-mono)' }}>84532</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Block Explorer</span>
              <a
                href="https://sepolia.basescan.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                sepolia.basescan.org
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Contracts</span>
              <span className="text-emerald-400 font-medium">8 deployed &amp; verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Mainnet Token</span>
              <span className="text-white font-medium">Base (Chain ID 8453)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">DEX</span>
              <span className="text-white font-medium">Uniswap V4</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default Roadmap
