import { motion } from 'framer-motion'
import { Coins, Lock, ArrowDownLeft, ArrowUpRight, Shield, Loader2, ExternalLink } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import { AnimatedCounter } from '@/components/app/StatCard'
import { useBunkerBalance, useStakeInfo, useTxUrl } from '@/hooks/useContracts'
import { useTransactionHistory, type TxKind } from '@/hooks/useTransactionHistory'
import { useRole } from '@/hooks/useRole'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'

const TIER_NAMES = ['None', 'Starter', 'Bronze', 'Silver', 'Gold', 'Platinum']

const KIND_CONFIG: Record<TxKind, { icon: typeof Coins; color: string; sign: '+' | '-' | '' }> = {
  transfer_in:       { icon: ArrowDownLeft,  color: 'text-green-400',  sign: '+' },
  transfer_out:      { icon: ArrowUpRight,   color: 'text-red-400',    sign: '-' },
  escrow_created:    { icon: Lock,           color: 'text-amber-400',  sign: '-' },
  payment_released:  { icon: Coins,          color: 'text-green-400',  sign: '+' },
  refund:            { icon: ArrowDownLeft,   color: 'text-green-400',  sign: '+' },
  staked:            { icon: Lock,           color: 'text-blue-400',   sign: '-' },
  unstake_requested: { icon: Shield,         color: 'text-amber-400',  sign: '' },
  unstake_completed: { icon: ArrowDownLeft,  color: 'text-green-400',  sign: '+' },
  reward_claimed:    { icon: Coins,          color: 'text-green-400',  sign: '+' },
  slashed:           { icon: Shield,         color: 'text-red-400',    sign: '-' },
}

function formatTime(ts: number | undefined) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function TxLink({ hash }: { hash: `0x${string}` }) {
  const url = useTxUrl(hash)
  if (!url) return <span className="text-zinc-600 font-mono text-xs">{hash.slice(0, 10)}...</span>
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-zinc-500 hover:text-white transition-colors inline-flex items-center gap-1 font-mono text-xs"
    >
      {hash.slice(0, 10)}...
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}

export default function Billing() {
  const role = useRole()
  const { address } = useAccount()
  const { data: rawBalance } = useBunkerBalance()
  const { stake, tier } = useStakeInfo()
  const { items, loading, error } = useTransactionHistory()

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
        {/* BUNKER Balance */}
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
          {!address ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-600">
              Connect your wallet to view transaction history.
            </div>
          ) : loading ? (
            <div className="px-4 py-8 flex items-center justify-center gap-2 text-sm text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading on-chain history...
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-sm text-red-400">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-600">
              {isProvider
                ? 'No transactions yet. Earnings and payment history will appear here.'
                : 'No transactions yet. Payment history will appear here after your first deployment.'
              }
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 uppercase tracking-wider">Type</th>
                      <th className="text-right text-xs text-zinc-500 font-medium px-4 py-3 uppercase tracking-wider">Amount</th>
                      <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 uppercase tracking-wider">Date</th>
                      <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 uppercase tracking-wider">TX</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.slice(0, 50).map((item, i) => {
                      const cfg = KIND_CONFIG[item.kind]
                      const Icon = cfg.icon
                      return (
                        <tr key={`${item.txHash}-${i}`} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-900/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                              <span className="text-sm text-white">{item.label}</span>
                            </div>
                          </td>
                          <td className={`px-4 py-3 text-right font-mono text-sm ${cfg.color}`}>
                            {cfg.sign}{item.amount.toLocaleString()} BUNKER
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-400">
                            {formatTime(item.timestamp)}
                          </td>
                          <td className="px-4 py-3">
                            <TxLink hash={item.txHash} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-zinc-800/30">
                {items.slice(0, 50).map((item, i) => {
                  const cfg = KIND_CONFIG[item.kind]
                  const Icon = cfg.icon
                  return (
                    <div key={`${item.txHash}-${i}`} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${cfg.color}`} />
                        <div className="min-w-0">
                          <p className="text-sm text-white">{item.label}</p>
                          <p className="text-xs text-zinc-500">{formatTime(item.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-mono ${cfg.color}`}>
                          {cfg.sign}{item.amount.toLocaleString()}
                        </p>
                        <TxLink hash={item.txHash} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {items.length > 50 && (
                <div className="px-4 py-2 text-center text-xs text-zinc-600 border-t border-zinc-800/30">
                  Showing 50 of {items.length} transactions
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
