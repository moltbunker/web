import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  color?: string
  prefix?: string
  suffix?: string
  trend?: { value: number; label: string }
  delay?: number
}

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) return
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, duration])

  return <>{display.toLocaleString()}</>
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  color = 'text-red-400',
  prefix = '',
  suffix = '',
  trend,
  delay = 0,
}: StatCardProps) {
  const isNumeric = typeof value === 'number'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.1)' }}
      className="bg-black border border-zinc-800 rounded-lg p-5 transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white font-mono">
        {prefix}
        {isNumeric ? <AnimatedCounter value={value} /> : value}
        {suffix}
      </p>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          <span>{trend.value >= 0 ? '+' : ''}{trend.value}%</span>
          <span className="text-zinc-600">{trend.label}</span>
        </div>
      )}
    </motion.div>
  )
}

// Re-export AnimatedCounter for use in other components
export { AnimatedCounter }
