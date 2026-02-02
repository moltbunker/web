import { motion } from 'framer-motion'

interface TerminalBlockProps {
  command: string
  children: React.ReactNode
}

const TerminalBlock = ({ command, children }: TerminalBlockProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <span className="text-[10px] text-zinc-500 ml-2" style={{ fontFamily: 'var(--font-mono)' }}>
          {command}
        </span>
      </div>
      <div className="p-3 overflow-x-auto text-[11px] leading-relaxed" style={{ fontFamily: 'var(--font-mono)' }}>
        {children}
      </div>
    </motion.div>
  )
}

// Terminal text colors
export const Cmd = ({ children }: { children: React.ReactNode }) => (
  <span className="text-red-400">{children}</span>
)

export const Flag = ({ children }: { children: React.ReactNode }) => (
  <span className="text-blue-400">{children}</span>
)

export const Header = ({ children }: { children: React.ReactNode }) => (
  <span className="text-zinc-200 font-medium">{children}</span>
)

export const Desc = ({ children }: { children: React.ReactNode }) => (
  <span className="text-zinc-500">{children}</span>
)

export const Muted = ({ children }: { children: React.ReactNode }) => (
  <span className="text-zinc-600">{children}</span>
)

export const Value = ({ children }: { children: React.ReactNode }) => (
  <span className="text-green-400">{children}</span>
)

export const Line = () => (
  <div className="text-zinc-800 my-1.5">{'─'.repeat(45)}</div>
)

export const Br = () => <div className="h-2" />

export const Example = ({ children }: { children: React.ReactNode }) => (
  <div className="text-zinc-400">
    <span className="text-zinc-600">$</span> {children}
  </div>
)

export default TerminalBlock
