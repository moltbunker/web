import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'
import StatusCard from './StatusCard'

const components = [
  { component: 'Core Runtime', progress: 100 },
  { component: 'P2P Network', progress: 97 },
  { component: 'Threat Detection', progress: 94 },
  { component: 'Self-Cloning', progress: 91 },
  { component: 'Snapshot System', progress: 88 },
  { component: 'Tor Integration', progress: 96 },
  { component: 'Payment Contracts', progress: 0 },
  { component: 'Python SDK', progress: 89 },
  { component: 'CLI Commands', progress: 93 },
  { component: 'HTTP API', progress: 87 },
  { component: 'Provider Mode', progress: 85 },
  { component: 'Requester Mode', progress: 82 },
  { component: 'Testnet', progress: 76 },
  { component: 'Mainnet', progress: 0 },
]

const getStatus = (progress: number): 'complete' | 'in-progress' | 'pending' => {
  if (progress === 100) return 'complete'
  if (progress === 0) return 'pending'
  return 'in-progress'
}

const StatusSection = () => {
  const completeCount = components.filter(c => c.progress === 100).length
  const totalProgress = Math.round(components.reduce((acc, c) => acc + c.progress, 0) / components.length)

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      className="mb-16"
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10">
            <Terminal className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Implementation Status</h2>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-zinc-400">
            <span className="text-emerald-400 font-semibold">{completeCount}</span>/{components.length} complete
          </span>
          <span className="text-zinc-400">
            <span className="text-red-400 font-semibold">{totalProgress}%</span> total
          </span>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-800">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-xs text-zinc-500 ml-2" style={{ fontFamily: 'var(--font-mono)' }}>
            moltbunker status --all
          </span>
        </div>

        <div className="space-y-0">
          {components.map((item, index) => (
            <StatusCard
              key={item.component}
              component={item.component}
              status={getStatus(item.progress)}
              progress={item.progress}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default StatusSection
