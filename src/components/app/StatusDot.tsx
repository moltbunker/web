import { motion } from 'framer-motion'

type Status = 'running' | 'deploying' | 'stopped' | 'error' | 'pending' | 'created' | 'paused' | 'failed' | 'replicating'

const config: Record<Status, { color: string; animate: 'pulse' | 'spin' | 'none'; glow?: string }> = {
  running:     { color: 'bg-green-400', animate: 'pulse' },
  deploying:   { color: 'bg-amber-400', animate: 'spin' },
  replicating: { color: 'bg-blue-400', animate: 'spin' },
  pending:     { color: 'bg-amber-400', animate: 'pulse' },
  created:     { color: 'bg-blue-400', animate: 'none' },
  paused:      { color: 'bg-zinc-400', animate: 'none' },
  stopped:     { color: 'bg-zinc-500', animate: 'none' },
  error:       { color: 'bg-red-400', animate: 'pulse', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
  failed:      { color: 'bg-red-400', animate: 'pulse', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]' },
}

interface StatusDotProps {
  status: string
  showLabel?: boolean
  className?: string
}

export default function StatusDot({ status, showLabel = false, className = '' }: StatusDotProps) {
  const s = config[status as Status] ?? config.stopped

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <motion.span
        className={`w-2 h-2 rounded-full ${s.color} ${s.glow ?? ''}`}
        animate={
          s.animate === 'pulse'
            ? { opacity: [1, 0.4, 1] }
            : s.animate === 'spin'
            ? { rotate: 360 }
            : {}
        }
        transition={
          s.animate === 'pulse'
            ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            : s.animate === 'spin'
            ? { duration: 1.5, repeat: Infinity, ease: 'linear' }
            : {}
        }
      />
      {showLabel && (
        <span className="text-sm text-zinc-300 capitalize">{status}</span>
      )}
    </span>
  )
}
