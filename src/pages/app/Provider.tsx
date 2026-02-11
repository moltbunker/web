import { motion } from 'framer-motion'
import { Shield, TrendingUp, Clock, Cpu, CheckCircle } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import { AnimatedCounter } from '@/components/app/StatCard'
import { useStatus } from '@/hooks/useApi'

const tiers = [
  { name: 'Starter', min: 50_000_000 },
  { name: 'Bronze', min: 150_000_000 },
  { name: 'Silver', min: 500_000_000 },
  { name: 'Gold', min: 1_000_000_000 },
  { name: 'Platinum', min: 2_000_000_000 },
]

export default function Provider() {
  const { data: status } = useStatus()

  const currentTier = status?.staking_tier ?? 'Gold'
  const stakedAmount = status?.staking_amount ? Math.round(Number(status.staking_amount) / 1e18) : 1_200_000_000
  const currentTierIndex = tiers.findIndex(t => t.name === currentTier)

  return (
    <div className="space-y-8">
      <PageHeader title="Provider Dashboard" subtitle="Manage your staking, resources, and earnings" />

      {/* Current tier card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black border border-red-500/30 rounded-xl p-6 relative overflow-hidden"
      >
        {/* Animated red glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-3 mb-6 relative">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{currentTier} Tier</h2>
            <p className="text-sm text-zinc-400 font-mono">
              <AnimatedCounter value={stakedAmount} /> BUNKER staked
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {[
            { label: 'Earnings (30d)', value: 847_000, color: 'text-green-400', prefix: '' },
            { label: 'Jobs Completed', value: 142, color: 'text-white' },
            { label: 'Uptime', value: status?.uptime ?? '99.94%', color: 'text-white' },
            { label: 'Reputation', value: status?.reputation_score ?? 872, color: 'text-white', suffix: ' / 1000' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color} mt-1 font-mono`}>
                {typeof stat.value === 'number' ? <AnimatedCounter value={stat.value} /> : stat.value}
                {stat.suffix ?? ''}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Staking tiers — step indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Staking Tiers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {tiers.map((tier, i) => {
            const isActive = tier.name === currentTier
            const isDone = i < currentTierIndex

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ y: -2 }}
                className={`rounded-xl p-4 border transition-all duration-200 ${
                  isActive
                    ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    : isDone
                    ? 'bg-zinc-900/50 border-zinc-700'
                    : 'bg-zinc-900/30 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-semibold ${isActive ? 'text-red-400' : isDone ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {tier.name}
                  </p>
                  {isDone && <CheckCircle className="w-3.5 h-3.5 text-red-400" />}
                </div>
                <p className="text-xs text-zinc-500 font-mono">{tier.min >= 1_000_000_000 ? `${tier.min / 1_000_000_000}B` : `${tier.min / 1_000_000}M`} BUNKER</p>
                {isActive && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-400 mt-2"
                  >
                    Current
                  </motion.p>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Stake / Unstake actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm shadow-lg shadow-red-500/10"
        >
          Stake More
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="flex-1 px-4 py-3 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 rounded-lg transition-all text-sm"
        >
          Unstake
        </motion.button>
      </motion.div>

      {/* Node resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Node Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Cpu, label: 'CPU',
              used: status?.resources?.cpu_total ? status.resources.cpu_total - status.resources.cpu_available : 4,
              total: status?.resources?.cpu_total ?? 16,
              unit: 'cores',
            },
            {
              icon: TrendingUp, label: 'Memory',
              used: status?.resources?.memory_total_mb ? (status.resources.memory_total_mb - status.resources.memory_available_mb) / 1024 : 8,
              total: status?.resources?.memory_total_mb ? status.resources.memory_total_mb / 1024 : 32,
              unit: 'GB',
            },
            {
              icon: Clock, label: 'Storage',
              used: status?.resources?.storage_total_gb ? status.resources.storage_total_gb - status.resources.storage_available_gb : 120,
              total: status?.resources?.storage_total_gb ?? 500,
              unit: 'GB',
            },
          ].map((res, i) => {
            const pct = Math.round((res.used / res.total) * 100)
            return (
              <motion.div
                key={res.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-black border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <res.icon className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-400">{res.label}</span>
                </div>
                <p className="text-white font-mono text-sm mb-2">
                  {res.used} / {res.total} {res.unit}
                </p>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
                    className="bg-red-500 h-2 rounded-full"
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
