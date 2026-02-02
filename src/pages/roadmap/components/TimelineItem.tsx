import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Circle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface TimelineItemProps {
  title: string
  phase: string
  items: string[]
  status: 'complete' | 'current' | 'upcoming'
  icon: LucideIcon
  index?: number
  isLast?: boolean
}

const TimelineItem = ({ title, phase, items, status, icon: Icon, index = 0, isLast = false }: TimelineItemProps) => {
  const statusConfig = {
    complete: {
      nodeClass: 'bg-emerald-500 border-emerald-400',
      textClass: 'text-emerald-400',
      lineClass: 'bg-emerald-500/50',
      StatusIcon: CheckCircle2,
    },
    current: {
      nodeClass: 'bg-red-500 border-red-400',
      textClass: 'text-red-400',
      lineClass: 'bg-gradient-to-b from-red-500/50 to-zinc-700',
      StatusIcon: Clock,
    },
    upcoming: {
      nodeClass: 'bg-zinc-700 border-zinc-600',
      textClass: 'text-zinc-400',
      lineClass: 'bg-zinc-700',
      StatusIcon: Circle,
    },
  }

  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative pl-8 pb-8"
    >
      {!isLast && (
        <div className={`absolute left-[11px] top-6 w-0.5 h-[calc(100%-12px)] ${config.lineClass}`} />
      )}

      <motion.div
        animate={status === 'current' ? {
          boxShadow: [
            '0 0 0 rgba(239, 68, 68, 0)',
            '0 0 20px rgba(239, 68, 68, 0.5)',
            '0 0 0 rgba(239, 68, 68, 0)',
          ],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${config.nodeClass}`}
      >
        <config.StatusIcon className="w-3 h-3 text-white" />
      </motion.div>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${config.textClass}`} />
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 ${config.textClass}`} style={{ fontFamily: 'var(--font-mono)' }}>
            {phase}
          </span>
        </div>
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
              <span className={`w-1 h-1 rounded-full mt-2 ${status === 'complete' ? 'bg-emerald-500' : status === 'current' ? 'bg-red-500' : 'bg-zinc-600'}`} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default TimelineItem
