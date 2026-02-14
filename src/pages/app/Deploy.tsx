import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, ArrowRight, ArrowLeft, CheckCircle, Globe, Clock, Loader2, Cpu, HardDrive, MemoryStick, Zap, ShieldCheck, ExternalLink, X, Wallet, Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { parseUnits } from 'viem'
import { useConfig, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { waitForTransactionReceipt as waitForTxReceipt } from '@wagmi/core'
import PageHeader from '@/components/app/PageHeader'
import ImagePicker from '@/components/app/ImagePicker'
import TerminalLog from '@/components/app/TerminalLog'
import { useDeploy, useCatalog } from '@/hooks/useApi'
import { useTokenAllowance, useContractAddress, useTxUrl, useBunkerBalance } from '@/hooks/useContracts'
import { BUNKER_TOKEN_ABI, BUNKER_ESCROW_ABI } from '@/lib/contracts'
import type { DeployRequest } from '@/lib/api'
import type { ImagePreset } from '@/lib/presets'

const HOURS_PER_MONTH = 730

const tierIconMap: Record<string, LucideIcon> = {
  minimal: Cpu,
  standard: HardDrive,
  performance: MemoryStick,
  enterprise: Zap,
}

interface TierItem {
  id: string
  name: string
  desc: string
  cpu: string
  mem: string
  storage: string
  monthly: number
  icon: LucideIcon
  popular?: boolean
}

const DEFAULT_TIERS: TierItem[] = [
  { id: 'minimal', name: 'Minimal', desc: 'Lightweight tasks & bots', cpu: '1 vCPU', mem: '1 GB', storage: '10 GB', monthly: 100_000, icon: Cpu },
  { id: 'standard', name: 'Standard', desc: 'Web apps & APIs', cpu: '2 vCPU', mem: '4 GB', storage: '50 GB', monthly: 400_000, icon: HardDrive },
  { id: 'performance', name: 'Performance', desc: 'ML inference & databases', cpu: '4 vCPU', mem: '8 GB', storage: '200 GB', monthly: 1_500_000, icon: MemoryStick, popular: true },
  { id: 'enterprise', name: 'Enterprise', desc: 'Heavy compute & training', cpu: '8 vCPU', mem: '16 GB', storage: '500 GB', monthly: 5_000_000, icon: Zap },
]

const REGIONS = [
  { id: 'auto', name: 'Auto', sub: 'Nearest available node', icon: '⚡' },
]

const DURATION_PRESETS = [
  { label: '1h', value: 1 },
  { label: '6h', value: 6 },
  { label: '24h', value: 24 },
  { label: '7d', value: 168 },
  { label: '30d', value: 720 },
]

type Step = 1 | 2 | 3 | 4
type DeployPhase = 'idle' | 'approving' | 'creating_escrow' | 'confirming_escrow' | 'deploying'

function StepBar({ current }: { current: Step }) {
  const steps = ['Image', 'Resources', 'Configure', 'Deploy']
  return (
    <div className="flex items-center gap-1">
      {steps.map((label, i) => {
        const stepNum = i + 1
        const isDone = current > stepNum
        const isActive = current === stepNum
        return (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300 ${
                  isDone
                    ? 'bg-red-500 text-white'
                    : isActive
                    ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50'
                    : 'bg-zinc-800/80 text-zinc-600'
                }`}
              >
                {isDone ? <CheckCircle className="w-3 h-3" /> : stepNum}
              </div>
              <span className={`text-[11px] font-medium hidden sm:block ${isActive ? 'text-white' : isDone ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {label}
              </span>
            </div>
            {i < 3 && (
              <div className={`h-px flex-1 min-w-4 transition-colors duration-500 ${isDone ? 'bg-red-500/60' : 'bg-zinc-800'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const slideIn = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.2 },
}

export default function Deploy() {
  const [step, setStep] = useState<Step>(1)
  const [image, setImage] = useState('')
  const [preset, setPreset] = useState<ImagePreset | undefined>()
  const [duration, setDuration] = useState(24)

  const { data: catalog } = useCatalog()
  const TIERS = useMemo<TierItem[]>(() => {
    if (catalog?.tiers?.length) {
      return catalog.tiers
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(t => ({
          id: t.id,
          name: t.name,
          desc: t.description,
          cpu: t.cpu,
          mem: t.memory,
          storage: t.storage,
          monthly: t.monthly,
          icon: tierIconMap[t.id] || Cpu,
          popular: t.popular,
        }))
    }
    return DEFAULT_TIERS
  }, [catalog])

  const [tier, setTier] = useState<TierItem>(DEFAULT_TIERS[0])

  // Sync tier selection when catalog loads (keep current selection if it exists)
  useEffect(() => {
    if (TIERS.length && !TIERS.find(t => t.id === tier.id)) {
      setTier(TIERS[0])
    }
  }, [TIERS, tier.id])

  const [region, setRegion] = useState('auto')
  const [torOnly, setTorOnly] = useState(false)
  const [onionService, setOnionService] = useState(false)
  const [deployResult, setDeployResult] = useState<{ container_id: string; regions: string[]; replica_count: number } | null>(null)
  const [deployPhase, setDeployPhase] = useState<DeployPhase>('idle')
  const [deployError, setDeployError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showNoTokens, setShowNoTokens] = useState(false)

  const deploy = useDeploy()
  const wagmiConfig = useConfig()

  // Token balance + approval for escrow
  const { data: tokenBalance } = useBunkerBalance()
  const escrowAddress = useContractAddress('escrow')
  const tokenAddress = useContractAddress('token')
  const { data: currentAllowance, refetch: refetchAllowance } = useTokenAllowance(escrowAddress)

  // Approval TX state
  const {
    writeContract: writeApproval,
    data: approvalHash,
    isPending: approvalPending,
    error: approvalWriteError,
    reset: resetApproval,
  } = useWriteContract()
  const {
    isLoading: approvalConfirming,
    isSuccess: approvalSuccess,
    error: approvalReceiptError,
  } = useWaitForTransactionReceipt({ hash: approvalHash })
  const approvalTxUrl = useTxUrl(approvalHash)
  const approvalError = approvalWriteError || approvalReceiptError

  // Escrow creation TX (for writeContractAsync)
  const { writeContractAsync } = useWriteContract()

  const hourlyRate = tier.monthly / HOURS_PER_MONTH
  const totalCost = Math.round(hourlyRate * duration)
  const costWei = parseUnits(String(totalCost), 18)
  const durationSecs = BigInt(duration * 3600)
  const needsApproval = !currentAllowance || (currentAllowance as bigint) < costWei

  // Refetch allowance after approval confirms
  useEffect(() => {
    if (approvalSuccess) {
      refetchAllowance()
    }
  }, [approvalSuccess, refetchAllowance])

  const handleApprove = () => {
    if (!tokenAddress || !escrowAddress) return
    writeApproval({
      address: tokenAddress,
      abi: BUNKER_TOKEN_ABI,
      functionName: 'approve',
      args: [escrowAddress, costWei],
    })
  }

  const handleDeploy = async () => {
    if (!escrowAddress) return
    setDeployError(null)

    try {
      // Step 1: Create escrow on-chain (user's wallet pays)
      setDeployPhase('creating_escrow')
      const escrowHash = await writeContractAsync({
        address: escrowAddress,
        abi: BUNKER_ESCROW_ABI,
        functionName: 'createReservation',
        args: [costWei, durationSecs],
      })

      // Step 2: Wait for TX confirmation and parse reservationId
      setDeployPhase('confirming_escrow')
      const receipt = await waitForTxReceipt(wagmiConfig, { hash: escrowHash })

      // Parse ReservationCreated event: topic[0]=event sig, topic[1]=indexed reservationId
      const escrowLog = receipt.logs.find(
        log => log.address.toLowerCase() === escrowAddress.toLowerCase() && log.topics.length > 1
      )
      if (!escrowLog) {
        throw new Error('Failed to parse reservation ID from transaction receipt')
      }
      const reservationId = BigInt(escrowLog.topics[1]!).toString()

      // Step 3: Send deploy request to API with the reservation ID
      setDeployPhase('deploying')
      const result = await deploy.mutateAsync({
        image,
        tier: tier.id as DeployRequest['tier'],
        duration_hours: duration,
        region: region === 'auto' ? undefined : region,
        tor_only: torOnly,
        onion_service: onionService,
        reservation_id: reservationId,
      })

      setDeployResult(result)
      setDeployPhase('idle')
      setStep(4)
    } catch (err) {
      setDeployPhase('idle')
      setDeployError(err instanceof Error ? err.message : 'Deployment failed')
    }
  }

  const handleImageSelect = (img: string, p?: ImagePreset) => {
    setImage(img)
    setPreset(p)
    if (p) setTier(TIERS.find(t => t.id === p.defaultTier) ?? TIERS[0])
  }

  const formatCost = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n.toLocaleString()

  const isBusy = deployPhase !== 'idle'
  const phaseLabel = {
    idle: '',
    approving: 'Approving...',
    creating_escrow: 'Confirm in wallet...',
    confirming_escrow: 'Confirming escrow on-chain...',
    deploying: 'Deploying container...',
  }[deployPhase]

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Deploy Container" subtitle="Launch encrypted containers across the decentralized network." />

      {/* Step bar */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3">
        <StepBar current={step} />
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Step 1: Image ─── */}
        {step === 1 && (
          <motion.div key="step1" {...slideIn} className="space-y-4">
            <ImagePicker selected={image} onSelect={handleImageSelect} />
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => image && setStep(2)}
                disabled={!image}
                className="btn-action"
              >
                Next <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── Step 2: Resources ─── */}
        {step === 2 && (
          <motion.div key="step2" {...slideIn} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIERS.map((t, i) => {
                const selected = tier.id === t.id
                const Icon = t.icon
                return (
                  <motion.button
                    key={t.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setTier(t)}
                    whileHover={{ y: -2 }}
                    className={`group relative text-left rounded-xl border p-5 transition-all duration-200 ${
                      selected
                        ? 'bg-red-500/[0.04] border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.08)]'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {t.popular && (
                      <span className="absolute -top-2.5 left-4 text-[10px] font-semibold bg-red-500 text-white px-2.5 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        selected ? 'bg-red-500/15' : 'bg-zinc-800 group-hover:bg-zinc-700/80'
                      }`}>
                        <Icon className={`w-4 h-4 ${selected ? 'text-red-400' : 'text-zinc-500'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${selected ? 'text-white' : 'text-zinc-300'}`}>{t.name}</p>
                        <p className="text-[11px] text-zinc-500">{t.desc}</p>
                      </div>
                    </div>

                    {/* Specs row */}
                    <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 mb-3">
                      <span className={selected ? 'text-zinc-300' : ''}>{t.cpu}</span>
                      <span className="text-zinc-700">·</span>
                      <span className={selected ? 'text-zinc-300' : ''}>{t.mem}</span>
                      <span className="text-zinc-700">·</span>
                      <span className={selected ? 'text-zinc-300' : ''}>{t.storage}</span>
                    </div>

                    {/* Price */}
                    <div className={`font-mono ${selected ? 'text-red-400' : 'text-zinc-400'}`}>
                      <span className="text-base font-bold">{formatCost(t.monthly)}</span>
                      <span className="text-[11px] font-normal text-zinc-500 ml-1">BUNKER/mo</span>
                      <span className="text-[10px] text-zinc-600 ml-2">~{Math.round(t.monthly / HOURS_PER_MONTH).toLocaleString()}/hr</span>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </motion.div>
        )}

        {/* ─── Step 3: Configure ─── */}
        {step === 3 && (
          <motion.div key="step3" {...slideIn} className="space-y-5">

            {/* Duration */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  Duration
                </label>
                <span className="text-sm font-mono text-white">
                  {duration}h
                  {duration >= 24 && <span className="text-zinc-500 ml-1">({Math.round(duration / 24)}d)</span>}
                </span>
              </div>

              {/* Quick picks */}
              <div className="flex gap-2">
                {DURATION_PRESETS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      duration === d.value
                        ? 'bg-red-500/10 border-red-500/40 text-red-400'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <input
                type="range" min={1} max={720} value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full accent-red-500 h-1.5"
              />
            </div>

            {/* Region */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Globe className="w-4 h-4 text-zinc-500" />
                Region
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REGIONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRegion(r.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      region === r.id
                        ? 'bg-red-500/[0.04] border-red-500/40 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-base">{r.icon}</span>
                    <div>
                      <p className="text-xs font-medium">{r.name}</p>
                      <p className="text-[10px] text-zinc-600">{r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy toggles */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
              <p className="text-sm font-medium text-zinc-300 mb-3">Privacy</p>
              <div className="flex gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={torOnly} onChange={e => setTorOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 text-red-500 focus:ring-red-500/30 bg-zinc-900" />
                  <div>
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">Tor only</span>
                    <p className="text-[10px] text-zinc-600">Route all traffic through Tor</p>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={onionService} onChange={e => setOnionService(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 text-red-500 focus:ring-red-500/30 bg-zinc-900" />
                  <div>
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">.onion service</span>
                    <p className="text-[10px] text-zinc-600">Expose as hidden service</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Summary card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black border border-zinc-800 rounded-xl overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Summary</span>
                <span className="text-[10px] text-zinc-600 font-mono">3x replicated · encrypted</span>
              </div>
              <div className="px-5 py-4 space-y-2 text-sm">
                <SummaryRow label="Image" value={preset?.name ?? image} mono />
                <SummaryRow label="Resources" value={`${tier.name} — ${tier.cpu}, ${tier.mem}, ${tier.storage}`} />
                <SummaryRow label="Duration" value={`${duration}h${duration >= 24 ? ` (${Math.round(duration / 24)}d)` : ''}`} />
                <SummaryRow label="Region" value={REGIONS.find(r => r.id === region)?.name ?? region} />
                <SummaryRow label="Rate" value={`${formatCost(tier.monthly)}/mo (~${Math.round(tier.monthly / HOURS_PER_MONTH).toLocaleString()}/hr)`} mono />
                <div className="flex justify-between items-center border-t border-zinc-800 pt-3 mt-3">
                  <span className="text-zinc-300 font-medium">Total</span>
                  <span className="text-lg font-bold font-mono text-red-400">{formatCost(totalCost)} BUNKER</span>
                </div>
              </div>
            </motion.div>

            {/* Token Approval — only shown when user hasn't approved enough */}
            {needsApproval && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/40 border border-amber-500/20 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Token Approval Required</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Approve the escrow contract to spend {formatCost(totalCost)} BUNKER for this deployment.
                      This does not transfer tokens yet.
                    </p>
                  </div>
                </div>
                {approvalError && (
                  <p className="text-xs text-red-400">{(approvalError as Error).message?.slice(0, 150)}</p>
                )}
                {approvalSuccess && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-green-400">Approved</span>
                    {approvalTxUrl && (
                      <a href={approvalTxUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-zinc-300">
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    )}
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApprove}
                  disabled={approvalPending || approvalConfirming}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {approvalPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Confirm in wallet...</>
                  ) : approvalConfirming ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Confirming on-chain...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Approve {formatCost(totalCost)} BUNKER</>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-1">
              <button onClick={() => setStep(2)} disabled={isBusy} className="flex items-center gap-2 px-4 py-2.5 text-zinc-400 hover:text-white text-sm transition-colors disabled:opacity-50">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <motion.button
                whileHover={!isBusy && !needsApproval ? { scale: 1.02 } : {}}
                whileTap={!isBusy && !needsApproval ? { scale: 0.98 } : {}}
                onClick={() => {
                  const bal = tokenBalance as bigint | undefined
                  if (!bal || bal < costWei) {
                    setShowNoTokens(true)
                    return
                  }
                  setShowConfirm(true)
                }}
                disabled={isBusy || needsApproval}
                className="btn-action"
              >
                {isBusy ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {phaseLabel}</>
                ) : (
                  <><Rocket className="w-4 h-4" /> Deploy Container</>
                )}
              </motion.button>
            </div>

            {(deployError || deploy.isError) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400"
              >
                {deployError ?? deploy.error?.message ?? 'Deployment failed. Please try again.'}
              </motion.div>
            )}

            {/* Confirmation modal */}
            <AnimatePresence>
              {showConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  onClick={() => !isBusy && setShowConfirm(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md mx-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                      <h3 className="text-base font-semibold text-white">Confirm Deployment</h3>
                      <button
                        onClick={() => !isBusy && setShowConfirm(false)}
                        disabled={isBusy}
                        className="p-1 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4 space-y-4">
                      <p className="text-sm text-zinc-400">
                        Clicking confirm will open your wallet to create an escrow payment on the Base network.
                      </p>

                      {/* Transaction details */}
                      <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 space-y-2.5">
                        <div className="flex items-center gap-2 mb-3">
                          <Wallet className="w-4 h-4 text-red-400" />
                          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Transaction Details</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Action</span>
                          <span className="text-zinc-300">Create Escrow</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Contract</span>
                          <span className="text-zinc-300 font-mono text-xs">BunkerEscrow</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Amount</span>
                          <span className="text-red-400 font-mono font-semibold">{formatCost(totalCost)} BUNKER</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Duration</span>
                          <span className="text-zinc-300">{duration}h{duration >= 24 ? ` (${Math.round(duration / 24)}d)` : ''}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-500">Network</span>
                          <span className="text-zinc-300">Base Sepolia</span>
                        </div>
                      </div>

                      {/* Info note */}
                      <div className="flex items-start gap-2.5 text-xs text-zinc-500">
                        <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-600" />
                        <span>
                          Tokens are locked in the escrow contract and paid to providers over the deployment duration.
                          Unused tokens are refunded if you stop early.
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 px-5 py-4 border-t border-zinc-800">
                      <button
                        onClick={() => setShowConfirm(false)}
                        disabled={isBusy}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={!isBusy ? { scale: 1.02 } : {}}
                        whileTap={!isBusy ? { scale: 0.98 } : {}}
                        onClick={() => { setShowConfirm(false); handleDeploy() }}
                        disabled={isBusy}
                        className="btn-action flex-1 justify-center"
                      >
                        {isBusy ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> {phaseLabel}</>
                        ) : (
                          <><Wallet className="w-4 h-4" /> Confirm & Sign</>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Insufficient BUNKER balance dialog */}
            <AnimatePresence>
              {showNoTokens && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  onClick={() => setShowNoTokens(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-sm mx-4 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="px-5 py-5 space-y-4 text-center">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <Wallet className="w-7 h-7 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Insufficient BUNKER Balance</h3>
                        <p className="text-sm text-zinc-400">
                          You need <span className="text-red-400 font-mono font-semibold">{formatCost(totalCost)}</span> BUNKER to deploy this container.
                        </p>
                      </div>
                      <div className="bg-black/50 border border-zinc-800 rounded-xl px-4 py-3">
                        <p className="text-xs text-zinc-500 mb-1">Your balance</p>
                        <p className="text-sm font-mono text-white">
                          {tokenBalance ? formatCost(Number((tokenBalance as bigint) / BigInt(10 ** 18))) : '0'} BUNKER
                        </p>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Base Sepolia testnet tokens will be delivered to testers soon. Stay tuned.
                      </p>
                    </div>
                    <div className="px-5 py-4 border-t border-zinc-800">
                      <button
                        onClick={() => setShowNoTokens(false)}
                        className="w-full px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        Got it
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── Step 4: Confirmation ─── */}
        {step === 4 && deployResult && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <div className="text-center py-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-7 h-7 text-green-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-white">Deployment Initiated</h2>
              <p className="text-sm text-zinc-500 mt-1">Your container is being deployed to {deployResult.replica_count} nodes</p>
            </div>

            <TerminalLog
              title="deploy output"
              lines={[
                { level: 'info', message: `Container ${deployResult.container_id} created` },
                { level: 'info', message: `Image: ${image}` },
                { level: 'info', message: `Tier: ${tier.name} (${tier.cpu}, ${tier.mem})` },
                { level: 'info', message: `Regions: ${deployResult.regions.join(', ')}` },
                { level: 'info', message: `Replicas: ${deployResult.replica_count}x` },
                { level: 'info', message: `Cost: ${formatCost(totalCost)} BUNKER (${duration}h @ ~${Math.round(tier.monthly / HOURS_PER_MONTH).toLocaleString()}/hr)` },
                { level: 'info', message: 'Pulling image via IPFS...' },
                { level: 'info', message: 'Creating encrypted container...' },
                { level: 'info', message: 'Replication in progress...' },
              ]}
            />

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => { setStep(1); setImage(''); setPreset(undefined); setDeployResult(null); resetApproval() }}
              className="w-full px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Deploy Another
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Small helpers ── */

function NavButtons({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex justify-between pt-1">
      <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 text-zinc-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="btn-action"
      >
        Next <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
}

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between text-zinc-400">
      <span>{label}</span>
      <span className={`text-zinc-300 truncate max-w-[220px] text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
