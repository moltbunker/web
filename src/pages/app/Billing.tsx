import { motion } from 'framer-motion'
import { Coins, Lock } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import { AnimatedCounter } from '@/components/app/StatCard'
import { useBunkerBalance, useStakeInfo } from '@/hooks/useContracts'
import { useRole } from '@/hooks/useRole'
import { formatUnits } from 'viem'

const TIER_NAMES = ['None', 'Starter', 'Bronze', 'Silver', 'Gold', 'Platinum']

export default function Billing() {
  const role = useRole()
  const { data: rawBalance } = useBunkerBalance()
  const { stake, tier } = useStakeInfo()

  const bunkerBal = rawBalance ? Math.round(Number(formatUnits(rawBalance as bigint, 18))) : 0
  const staked = stake.data ? Math.round(Number(formatUnits(stake.data as bigint, 18))) : 0
  const tierName = tier.data !== undefined ? (TIER_NAMES[Number(tier.data)] ?? 'Unknown') : '—'
  const isProvider = role === 'provider'

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing"
        subtitle={isProvider ? 'Balance, earnings, and staking overview' : 'Balance and spending overview'}
      />

      {/* Balance cards */}
      <div className={`grid grid-cols-1 ${isProvider ? 'md:grid-cols-2' : ''} gap-4`}>
        {/* BUNKER Balance — always shown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.1)' }}
          className="bg-black border border-zinc-800 rounded-lg p-5 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">BUNKER Balance</span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            <AnimatedCounter value={bunkerBal} />
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            ~${(bunkerBal / 20000).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
          </p>
        </motion.div>

        {/* Staked — provider only */}
        {isProvider && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.1)' }}
            className="bg-black border border-zinc-800 rounded-lg p-5 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-red-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Staked</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">
              <AnimatedCounter value={staked} />
            </p>
            <p className="text-xs text-zinc-500 mt-1">{tierName} tier</p>
          </motion.div>
        )}
      </div>

      {/* Transaction history */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          {isProvider ? 'Earnings & Payments' : 'Payment History'}
        </h2>
        <div className="bg-black border border-zinc-800 rounded-lg overflow-hidden">
          <div className="px-4 py-8 text-center text-sm text-zinc-600">
            {isProvider
              ? 'No transactions yet. Earnings and payment history will appear here.'
              : 'No transactions yet. Payment history will appear here after your first deployment.'
            }
          </div>
        </div>
      </motion.div>
    </div>
  )
}
