import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { Box, Coins, Shield, Activity, Globe, Users, ShieldAlert, Wifi } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import StatCard from '@/components/app/StatCard'
import StatusDot from '@/components/app/StatusDot'
import { useStatus, useBalance, useThreat, useContainers } from '@/hooks/useApi'

const threatColors: Record<string, string> = {
  low: 'text-green-400 bg-green-500/10 border-green-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  critical: 'text-red-500 bg-red-500/20 border-red-500/30',
  unknown: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
}

// Mock activity for fallback
const mockActivity = [
  { id: '1', action: 'Container deployed', target: 'nginx-prod-01', time: '2 min ago', status: 'running' },
  { id: '2', action: 'Escrow funded', target: '500,000 BUNKER reserved', time: '15 min ago', status: 'running' },
  { id: '3', action: 'Health check passed', target: 'redis-cache-03', time: '1 hr ago', status: 'running' },
  { id: '4', action: 'Stake increased', target: '+2,000,000 BUNKER', time: '3 hr ago', status: 'running' },
  { id: '5', action: 'Container stopped', target: 'dev-sandbox-02', time: '6 hr ago', status: 'stopped' },
]

export default function Overview() {
  const { address } = useAccount()
  const { data: status } = useStatus()
  const { data: balance } = useBalance()
  const { data: threat } = useThreat()
  const { data: containers } = useContainers()

  const activeCount = containers?.filter(c => c.status === 'running').length ?? 3
  const bunkerBalance = balance ? Math.round(Number(balance.bunker_balance) / 1e18) : 12_450_000
  const tierName = status?.staking_tier ?? 'Gold'
  const uptimeStr = status?.uptime ?? '99.94%'
  const threatLevel = threat?.level ?? 'low'
  const threatScore = threat?.score ?? 0.05

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={`${address?.slice(0, 6)}...${address?.slice(-4)}`}
      />

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/3 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Containers" value={activeCount} icon={Box} color="text-blue-400" delay={0} />
        <StatCard label="BUNKER Balance" value={bunkerBalance} icon={Coins} color="text-amber-400" delay={0.1} />
        <StatCard label="Staking Tier" value={tierName} icon={Shield} color="text-red-400" delay={0.2} />
        <StatCard label="Uptime" value={uptimeStr} icon={Activity} color="text-green-400" delay={0.3} />
      </div>

      {/* Threat + Network row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Threat level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black border border-zinc-800 rounded-lg p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Threat Level</span>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${threatColors[threatLevel]}`}>
              {threatLevel}
            </span>
          </div>
          <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${threatScore * 100}%` }}
              transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                threatLevel === 'low' ? 'bg-green-500' :
                threatLevel === 'medium' ? 'bg-amber-500' :
                'bg-red-500'
              }`}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-2 font-mono">
            Score: {threatScore.toFixed(2)} / 1.00
          </p>
        </motion.div>

        {/* Network status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black border border-zinc-800 rounded-lg p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-300">Network Status</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Peers</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-sm text-white font-mono">{status?.peer_count ?? 12}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Region</p>
              <p className="text-sm text-white mt-1 font-mono">{status?.region ?? 'europe'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Tor</p>
              <div className="flex items-center gap-1.5 mt-1">
                <StatusDot status={status?.tor_enabled ? 'running' : 'stopped'} />
                <span className="text-sm text-zinc-300">{status?.tor_enabled ? 'Active' : 'Disabled'}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Transport</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Wifi className="w-3.5 h-3.5 text-green-400" />
                <span className="text-sm text-zinc-300">TLS 1.3</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="bg-black border border-zinc-800 rounded-lg divide-y divide-zinc-800/50 overflow-hidden">
          {mockActivity.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <StatusDot status={item.status} />
                <div>
                  <p className="text-sm text-white">{item.action}</p>
                  <p className="text-xs text-zinc-500">{item.target}</p>
                </div>
              </div>
              <span className="text-xs text-zinc-500">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
