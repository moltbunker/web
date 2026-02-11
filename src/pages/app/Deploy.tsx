import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, ArrowRight, ArrowLeft, CheckCircle, Globe, Clock, Loader2, Cpu, HardDrive, MemoryStick, Zap } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import ImagePicker from '@/components/app/ImagePicker'
import TerminalLog from '@/components/app/TerminalLog'
import { useDeploy } from '@/hooks/useApi'
import type { ImagePreset } from '@/lib/presets'

const HOURS_PER_MONTH = 730

const TIERS = [
  { id: 'minimal' as const, name: 'Minimal', desc: 'Lightweight tasks & bots', cpu: '1 vCPU', mem: '1 GB', storage: '10 GB', monthly: 100_000, icon: Cpu },
  { id: 'standard' as const, name: 'Standard', desc: 'Web apps & APIs', cpu: '2 vCPU', mem: '4 GB', storage: '50 GB', monthly: 400_000, icon: HardDrive },
  { id: 'performance' as const, name: 'Performance', desc: 'ML inference & databases', cpu: '4 vCPU', mem: '8 GB', storage: '200 GB', monthly: 1_500_000, icon: MemoryStick, popular: true },
  { id: 'enterprise' as const, name: 'Enterprise', desc: 'Heavy compute & training', cpu: '8 vCPU', mem: '16 GB', storage: '500 GB', monthly: 5_000_000, icon: Zap },
]

const REGIONS = [
  { id: 'auto', name: 'Auto', sub: 'Nearest node', icon: '⚡' },
  { id: 'americas', name: 'Americas', sub: 'US / Canada / LATAM', icon: '🌎' },
  { id: 'europe', name: 'Europe', sub: 'EU / UK / Nordics', icon: '🌍' },
  { id: 'asia_pacific', name: 'Asia Pacific', sub: 'JP / SG / AU', icon: '🌏' },
]

const DURATION_PRESETS = [
  { label: '1h', value: 1 },
  { label: '6h', value: 6 },
  { label: '24h', value: 24 },
  { label: '7d', value: 168 },
  { label: '30d', value: 720 },
]

type Step = 1 | 2 | 3 | 4

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
  const [tier, setTier] = useState<typeof TIERS[number]>(TIERS[1])
  const [duration, setDuration] = useState(24)
  const [region, setRegion] = useState('auto')
  const [torOnly, setTorOnly] = useState(false)
  const [onionService, setOnionService] = useState(false)
  const [deployResult, setDeployResult] = useState<{ container_id: string; regions: string[]; replica_count: number } | null>(null)

  const deploy = useDeploy()

  const hourlyRate = tier.monthly / HOURS_PER_MONTH
  const totalCost = Math.round(hourlyRate * duration)

  const handleDeploy = async () => {
    try {
      const result = await deploy.mutateAsync({
        image,
        tier: tier.id,
        duration_hours: duration,
        region: region === 'auto' ? undefined : region,
        tor_only: torOnly,
        onion_service: onionService,
      })
      setDeployResult(result)
      setStep(4)
    } catch {
      // Error handled by mutation state
    }
  }

  const handleImageSelect = (img: string, p?: ImagePreset) => {
    setImage(img)
    setPreset(p)
    if (p) setTier(TIERS.find(t => t.id === p.defaultTier) ?? TIERS[1])
  }

  const formatCost = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n.toLocaleString()

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
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
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

            {/* Actions */}
            <div className="flex justify-between pt-1">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-4 py-2.5 text-zinc-400 hover:text-white text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeploy}
                disabled={deploy.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-zinc-700 disabled:to-zinc-800 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-500/20 transition-all"
              >
                {deploy.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deploying...</>
                ) : (
                  <><Rocket className="w-4 h-4" /> Deploy Container</>
                )}
              </motion.button>
            </div>

            {deploy.isError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400"
              >
                {deploy.error?.message ?? 'Deployment failed. Please try again.'}
              </motion.div>
            )}
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
              onClick={() => { setStep(1); setImage(''); setPreset(undefined); setDeployResult(null) }}
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
        className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
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
