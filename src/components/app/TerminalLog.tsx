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
  info: 'text-zinc-300',
  warn: 'text-amber-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
  debug: 'text-zinc-500',
  fatal: 'text-red-500 font-bold',
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
        className="p-4 font-mono text-xs space-y-0.5 overflow-y-auto"
        style={{ maxHeight }}
      >
        {lines.length === 0 ? (
          <div className="text-zinc-600">Waiting for logs...</div>
        ) : (
          lines.map((line, i) => {
            const color = levelColors[line.level?.toLowerCase() ?? ''] ?? 'text-zinc-300'
            return (
              <div key={i} className={color}>
                {line.timestamp && (
                  <span className="text-zinc-600">{line.timestamp} </span>
                )}
                {line.level && (
                  <span className={`${color} font-medium`}>[{line.level}] </span>
                )}
                <span>{line.message}</span>
              </div>
            )
          })
        )}
        {/* Blinking cursor */}
        <motion.span
          className="inline-block w-2 h-3.5 bg-zinc-500 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </div>
    </motion.div>
  )
}
