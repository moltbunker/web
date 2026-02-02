import { motion } from 'framer-motion'

interface StatusCardProps {
  component: string
  status: 'complete' | 'in-progress' | 'pending'
  progress: number
  index?: number
}

const StatusCard = ({ component, status, progress, index = 0 }: StatusCardProps) => {
  const statusConfig = {
    complete: {
      badge: 'Complete',
      badgeClass: 'text-emerald-400',
      barClass: 'bg-emerald-500',
      glowClass: 'shadow-emerald-500/20',
    },
    'in-progress': {
      badge: 'In Progress',
      badgeClass: 'text-amber-400',
      barClass: 'bg-amber-500',
      glowClass: 'shadow-amber-500/20',
    },
    pending: {
      badge: 'Pending',
      badgeClass: 'text-red-400',
      barClass: 'bg-red-500',
      glowClass: 'shadow-red-500/20',
    },
  }

  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="flex items-center gap-4 py-2.5 border-b border-zinc-800/50 last:border-0"
    >
      <span className="flex-1 text-sm text-zinc-300">{component}</span>
      <span className={`text-xs font-medium w-20 text-right ${config.badgeClass}`} style={{ fontFamily: 'var(--font-mono)' }}>
        {config.badge}
      </span>
      <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${progress}%` }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.03 + 0.2, duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${config.barClass} shadow-lg ${config.glowClass}`}
        />
      </div>
      <span
        className="text-xs text-zinc-400 w-10 text-right"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {progress}%
      </span>
    </motion.div>
  )
}

export default StatusCard
