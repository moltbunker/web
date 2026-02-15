import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface LogLine {
  timestamp?: string
  level?: string
  message: string
}

interface TerminalLogProps {
  lines: LogLine[]
  title?: string
  maxHeight?: string
  className?: string
}

const levelColors: Record<string, string> = {
  info: 'text-zinc-400',
  warn: 'text-amber-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
  debug: 'text-zinc-600',
  fatal: 'text-red-500 font-bold',
}

const levelBadge: Record<string, string> = {
  info: 'text-blue-400/70',
  warn: 'text-amber-400/80',
  warning: 'text-amber-400/80',
  error: 'text-red-400/90',
  debug: 'text-zinc-600',
  fatal: 'text-red-500',
}

/** Format ISO timestamp to short HH:MM:SS */
function shortTime(iso: string): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return iso
  }
}

export default function TerminalLog({
  lines,
  title = 'terminal',
  maxHeight = '400px',
  className = '',
}: TerminalLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black border border-zinc-800 rounded-xl overflow-hidden ${className}`}
    >
      {/* Traffic light header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-xs text-zinc-600 ml-2 font-mono">{title}</span>
        </div>
      </div>

      {/* Log content */}
      <div
        ref={scrollRef}
        className="p-4 font-mono text-xs leading-5 overflow-y-auto"
        style={{ maxHeight }}
      >
        {lines.length === 0 ? (
          <div className="text-zinc-600">Waiting for logs...</div>
        ) : (
          lines.map((line, i) => {
            const lvl = line.level?.toLowerCase() ?? ''
            const msgColor = levelColors[lvl] ?? 'text-zinc-300'
            const badge = levelBadge[lvl] ?? 'text-zinc-500'
            return (
              <div key={i} className="flex gap-0 hover:bg-zinc-900/40 -mx-1 px-1 rounded">
                {line.timestamp && (
                  <span className="text-zinc-600 shrink-0 w-[70px] select-none">
                    {shortTime(line.timestamp)}
                  </span>
                )}
                {line.level && (
                  <span className={`${badge} shrink-0 w-[42px] text-right mr-2 select-none`}>
                    {line.level}
                  </span>
                )}
                <span className={msgColor}>{line.message}</span>
              </div>
            )
          })
        )}
        {/* Blinking cursor */}
        <motion.span
          className="inline-block w-2 h-3.5 bg-zinc-500 align-middle mt-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </div>
    </motion.div>
  )
}
