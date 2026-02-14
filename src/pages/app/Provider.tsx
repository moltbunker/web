import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, Lock, Globe, Cpu, TrendingUp, Clock, CheckCircle, X, ExternalLink, Loader2 } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import { AnimatedCounter } from '@/components/app/StatCard'
import { useStatus } from '@/hooks/useApi'
import { useStakeInfo, useBunkerBalance, useContractAddress, useContractWrite, useTxUrl } from '@/hooks/useContracts'
import { useRole } from '@/hooks/useRole'
import { formatUnits, parseUnits } from 'viem'
import { BUNKER_TOKEN_ABI, BUNKER_STAKING_ABI } from '@/lib/contracts'

const TIER_NAMES = ['None', 'Starter', 'Bronze', 'Silver', 'Gold', 'Platinum']

const tiers = [
  { name: 'Starter', min: 1_000_000 },
  { name: 'Bronze', min: 5_000_000 },
  { name: 'Silver', min: 10_000_000 },
  { name: 'Gold', min: 100_000_000 },
  { name: 'Platinum', min: 1_000_000_000 },
]

// ─── Staking Modal ────────────────────────────────────────────────────────────

function StakingModal({ mode, onClose }: { mode: 'stake' | 'unstake'; onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'input' | 'approve' | 'stake' | 'done'>('input')
  const { data: rawBalance } = useBunkerBalance()
  const { stake } = useStakeInfo()
  const tokenAddress = useContractAddress('token')
  const stakingAddress = useContractAddress('staking')

  const balance = rawBalance ? Number(formatUnits(rawBalance as bigint, 18)) : 0
  const staked = stake.data ? Number(formatUnits(stake.data as bigint, 18)) : 0
  const maxAmount = mode === 'stake' ? balance : staked

  const {
    writeContract: writeApprove,
    isPending: approvePending,
    isConfirming: approveConfirming,
    isSuccess: approveSuccess,
    error: approveError,
    hash: approveHash,
    reset: resetApprove,
  } = useContractWrite()

  const {
    writeContract: writeStake,
    isPending: stakePending,
    isConfirming: stakeConfirming,
    isSuccess: stakeSuccess,
    error: stakeError,
    hash: stakeHash,
    reset: resetStake,
  } = useContractWrite()

  const txUrl = useTxUrl(step === 'approve' ? approveHash : stakeHash)

  const handleMax = useCallback(() => {
    setAmount(Math.floor(maxAmount).toString())
  }, [maxAmount])

  const parsedAmount = amount ? parseUnits(amount, 18) : 0n

  const handleSubmit = useCallback(() => {
    if (!tokenAddress || !stakingAddress || !parsedAmount) return

    if (mode === 'stake') {
      // Step 1: approve
      setStep('approve')
      writeApprove({
        address: tokenAddress,
        abi: BUNKER_TOKEN_ABI,
        functionName: 'approve',
        args: [stakingAddress, parsedAmount],
      })
    } else {
      // Unstake: single step
      setStep('stake')
      writeStake({
        address: stakingAddress,
        abi: BUNKER_STAKING_ABI,
        functionName: 'requestUnstake',
        args: [parsedAmount],
      })
    }
  }, [tokenAddress, stakingAddress, parsedAmount, mode, writeApprove, writeStake])

  // After approve succeeds, proceed to stake
  const handleStakeAfterApprove = useCallback(() => {
    if (!stakingAddress || !parsedAmount) return
    setStep('stake')
    resetApprove()
    writeStake({
      address: stakingAddress,
      abi: BUNKER_STAKING_ABI,
      functionName: 'stake',
      args: [parsedAmount],
    })
  }, [stakingAddress, parsedAmount, resetApprove, writeStake])

  const isProcessing = approvePending || approveConfirming || stakePending || stakeConfirming
  const error = approveError || stakeError

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            {mode === 'stake' ? 'Stake BUNKER' : 'Unstake BUNKER'}
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount input */}
        <div className="mb-4">
          <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={step !== 'input'}
              placeholder="0"
              className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-red-500/50 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={handleMax}
              disabled={step !== 'input'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
            >
              MAX
            </button>
          </div>
          <p className="text-xs text-zinc-600 mt-1.5 font-mono">
            Available: {Math.floor(maxAmount).toLocaleString()} BUNKER
          </p>
        </div>

        {/* Tier preview for staking */}
        {mode === 'stake' && amount && Number(amount) > 0 && (
          <div className="mb-4 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">After staking</p>
            <p className="text-sm text-white font-mono">
              {Math.round(staked + Number(amount)).toLocaleString()} BUNKER total
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400">{(error as Error).message?.slice(0, 120) ?? 'Transaction failed'}</p>
          </div>
        )}

        {/* TX status */}
        {step !== 'input' && (
          <div className="mb-4 space-y-2">
            {mode === 'stake' && (
              <div className="flex items-center gap-2 text-sm">
                {approveSuccess || step === 'stake' || step === 'done' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : approvePending || approveConfirming ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-zinc-600" />
                )}
                <span className={step === 'approve' ? 'text-white' : 'text-zinc-500'}>
                  {approvePending ? 'Confirm approval in wallet...' : approveConfirming ? 'Approving...' : 'Approve'}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              {stakeSuccess ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : stakePending || stakeConfirming ? (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-zinc-600" />
              )}
              <span className={step === 'stake' ? 'text-white' : 'text-zinc-500'}>
                {stakePending ? 'Confirm in wallet...' : stakeConfirming ? 'Confirming...' : mode === 'stake' ? 'Stake' : 'Unstake'}
              </span>
            </div>
          </div>
        )}

        {/* BaseScan link */}
        {txUrl && (
          <a
            href={txUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-4 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View on BaseScan
          </a>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {step === 'input' && (
            <button
              onClick={handleSubmit}
              disabled={!amount || Number(amount) <= 0 || Number(amount) > maxAmount}
              className="btn-action flex-1 justify-center"
            >
              {mode === 'stake' ? 'Approve & Stake' : 'Request Unstake'}
            </button>
          )}

          {step === 'approve' && approveSuccess && (
            <button
              onClick={handleStakeAfterApprove}
              className="btn-action flex-1 justify-center"
            >
              Stake Now
            </button>
          )}

          {stakeSuccess && (
            <button
              onClick={() => { resetStake(); onClose() }}
              className="flex-1 px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-400 font-semibold rounded-lg"
            >
              Done
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── BecomeProvider ───────────────────────────────────────────────────────────

function BecomeProvider() {
  const [showStaking, setShowStaking] = useState(false)

  return (
    <div className="space-y-8">
      <PageHeader title="Become a Provider" subtitle="Stake BUNKER tokens and earn by hosting containers on the network" />

      {/* Hero CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl border border-zinc-800 bg-black p-8 sm:p-10 overflow-hidden text-center"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Provide Compute, Earn BUNKER
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-8">
            Run a provider node to offer CPU, memory, and storage to the network.
            Stake tokens to qualify, earn rewards for every job completed, and build your reputation.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowStaking(true)}
            className="btn-action"
          >
            Start Staking
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { icon: Zap, title: 'Earn Rewards', desc: 'Get paid per CPU-hour, GB-hour, and network usage for every container you host.' },
          { icon: Lock, title: 'Encrypted & Secure', desc: 'All workloads run in encrypted containers with seccomp isolation and TLS 1.3.' },
          { icon: Globe, title: 'Global Network', desc: 'Join providers across multiple regions. Higher tiers unlock more job assignments.' },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-black border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
          >
            <item.icon className="w-5 h-5 text-red-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tier overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Staking Tiers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              whileHover={{ y: -2 }}
              className="rounded-xl p-4 border bg-zinc-900/30 border-zinc-800 transition-all duration-200"
            >
              <p className="text-sm font-semibold text-zinc-400 mb-2">{tier.name}</p>
              <p className="text-xs text-zinc-500 font-mono">
                {tier.min >= 1_000_000_000 ? `${tier.min / 1_000_000_000}B` : `${tier.min / 1_000_000}M`} BUNKER
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {showStaking && <StakingModal mode="stake" onClose={() => setShowStaking(false)} />}
      </AnimatePresence>
    </div>
  )
}

// ─── Provider Dashboard ───────────────────────────────────────────────────────

function ProviderDashboard() {
  const { data: status } = useStatus()
  const { stake, tier } = useStakeInfo()
  const [modalMode, setModalMode] = useState<'stake' | 'unstake' | null>(null)

  const stakedAmount = stake.data ? Math.round(Number(formatUnits(stake.data as bigint, 18))) : 0
  const currentTier = tier.data !== undefined ? (TIER_NAMES[Number(tier.data)] ?? '—') : '—'
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
            { label: 'Earnings (30d)', value: 0, color: 'text-green-400' },
            { label: 'Jobs Completed', value: 0, color: 'text-white' },
            { label: 'Uptime', value: status?.uptime ?? '—', color: 'text-white' },
            { label: 'Reputation', value: status?.reputation_score ?? 0, color: 'text-white', suffix: ' / 1000' },
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

      {/* Staking tiers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Staking Tiers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {tiers.map((t, i) => {
            const isActive = t.name === currentTier
            const isDone = i < currentTierIndex

            return (
              <motion.div
                key={t.name}
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
                    {t.name}
                  </p>
                  {isDone && <CheckCircle className="w-3.5 h-3.5 text-red-400" />}
                </div>
                <p className="text-xs text-zinc-500 font-mono">{t.min >= 1_000_000_000 ? `${t.min / 1_000_000_000}B` : `${t.min / 1_000_000}M`} BUNKER</p>
                {isActive && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 mt-2">
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
          onClick={() => setModalMode('stake')}
          className="btn-action flex-1 justify-center"
        >
          Stake More
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setModalMode('unstake')}
          className="flex-1 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all text-sm"
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
            { icon: Cpu, label: 'CPU', used: 0, total: 0, unit: 'cores' },
            { icon: TrendingUp, label: 'Memory', used: 0, total: 0, unit: 'GB' },
            { icon: Clock, label: 'Storage', used: 0, total: 0, unit: 'GB' },
          ].map((res, i) => {
            const p = res.total > 0 ? Math.round((res.used / res.total) * 100) : 0
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
                    animate={{ width: `${p}%` }}
                    transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
                    className="bg-red-500 h-2 rounded-full"
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {modalMode && <StakingModal mode={modalMode} onClose={() => setModalMode(null)} />}
      </AnimatePresence>
    </div>
  )
}

// ─── Provider Page (root) ─────────────────────────────────────────────────────

export default function Provider() {
  const role = useRole()
  if (role === 'provider') return <ProviderDashboard />
  return <BecomeProvider />
}
