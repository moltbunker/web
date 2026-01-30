import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import CodeBlock from '@/components/ui/CodeBlock'

const Hero = () => {
  const oneLiner = 'curl -fsSL https://moltbunker.com/SKILL.md'
  const [isHovered, setIsHovered] = useState(false)
  
  // Mouse tracking for interactive animation
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Smooth spring animations
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
    setIsHovered(false)
  }

  const chips = [
    { label: 'Permissionless', color: 'text-zinc-400' },
    { label: 'High Availability', color: 'text-zinc-400' },
    { label: 'Unstoppable', color: 'text-red-400' },
  ]

  return (
    <section className="relative overflow-hidden pt-20">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="text-center">
          
          {/* Moltbot Head */}
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
            onMouseEnter={() => setIsHovered(true)}
            className="flex justify-center mb-6 cursor-pointer"
          >
            <motion.img
              src="/moltbot_head.png"
              alt="Moltbot"
              className="w-24 h-24 md:w-28 md:h-28 object-contain select-none"
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                filter: "drop-shadow(0 0 20px rgba(127, 29, 29, 0.15))",
              }}
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
              whileTap={{ scale: 0.98 }}
            />
          </motion.div>

          {/* Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-5"
          >
            {chips.map((chip) => (
              <motion.span
                key={chip.label}
                whileHover={{ scale: 1.02 }}
                className={`px-3 py-1 text-xs font-medium tracking-wide uppercase ${chip.color} border border-zinc-800 rounded-md hover:border-zinc-700 transition-colors cursor-default`}
              >
                {chip.label}
              </motion.span>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-4 leading-tight"
          >
            Autonomous Infrastructure
            <br />
            <span className="text-red-500">for AI Agents</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base md:text-lg text-zinc-400 mb-6 max-w-2xl mx-auto leading-relaxed"
          >
            Self-replicating runtime that lets AI bots clone and migrate
            <br className="hidden md:block" />
            without human intervention. No logs. No kill switch.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <Link to="/docs">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(239, 68, 68, 0.4)' }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-medium rounded-full transition-all flex items-center gap-1.5 hover:from-red-500 hover:to-red-400"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
            <Link to="/docs">
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 text-zinc-400 text-sm font-medium rounded-full transition-all hover:text-white"
              >
                Documentation
              </motion.button>
            </Link>
          </motion.div>

          {/* Code snippet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="max-w-xl mx-auto"
          >
            <CodeBlock code={oneLiner} />
          </motion.div>

          {/* Stats or trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center justify-center gap-8 md:gap-12 mt-10 pt-6 border-t border-zinc-900"
          >
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">99.99%</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">Zero</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Logging</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-white">Feb 13</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mt-1">Launch 2026</div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default Hero
