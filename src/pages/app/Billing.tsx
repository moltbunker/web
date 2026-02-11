import { motion } from 'framer-motion'
import { Coins, Lock, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import { AnimatedCounter } from '@/components/app/StatCard'
import { useBalance } from '@/hooks/useApi'

const mockPayments = [
  { id: 'tx-001', type: 'escrow_fund', amount: '-500,000', description: 'Escrow for mb-a1b2c3d4', time: '2h ago' },
  { id: 'tx-002', type: 'provider_earn', amount: '+120,000', description: 'Provider earnings', time: '6h ago' },
  { id: 'tx-003', type: 'escrow_release', amount: '+250,000', description: 'Escrow refund mb-j0k1l2m3', time: '1d ago' },
  { id: 'tx-004', type: 'escrow_fund', amount: '-1,200,000', description: 'Escrow for mb-d4e5f6g7', time: '2d ago' },
  { id: 'tx-005', type: 'stake', amount: '-1,200,000,000', description: 'Staked to Gold tier', time: '5d ago' },
]

export default function Billing() {
  const { data: balance } = useBalance()

  const bunkerBal = balance ? Math.round(Number(balance.bunker_balance) / 1e18) : 12_450_000
  const escrowed = balance ? Math.round(Number(balance.reserved) / 1e18) : 1_700_000
  const staked = balance ? Math.round(Number(balance.deposited) / 1e18) : 1_200_000_000

  return (
    <div className="space-y-8">
      <PageHeader title="Billing" subtitle="Balance, payments, and staking overview" />

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Coins, color: 'text-amber-400', label: 'BUNKER Balance', value: bunkerBal, sub: `~$${(bunkerBal * 0.001).toLocaleString()} USD` },
          { icon: Lock, color: 'text-blue-400', label: 'In Escrow', value: escrowed, sub: '2 active reservations' },
          { icon: Lock, color: 'text-red-400', label: 'Staked', value: staked, sub: 'Gold tier' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.1)' }}
            className="bg-black border border-zinc-800 rounded-lg p-5 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-3">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono">
              <AnimatedCounter value={card.value as number} />
            </p>
            <p className="text-xs text-zinc-500 mt-1">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Payment history */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Payment History</h2>
        <div className="bg-black border border-zinc-800 rounded-lg divide-y divide-zinc-800/50 overflow-hidden">
          {mockPayments.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {tx.amount.startsWith('+') ? (
                  <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-green-400" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-white">{tx.description}</p>
                  <p className="text-xs text-zinc-500">{tx.time}</p>
                </div>
              </div>
              <span className={`text-sm font-mono ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {tx.amount} BUNKER
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
