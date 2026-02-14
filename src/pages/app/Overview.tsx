import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import {
  Box, Coins, Activity, Users, Shield, ShieldCheck, Cpu, HardDrive, MemoryStick,
  Lock, Globe, Wifi, WifiOff, Server, CheckCircle, Ban, Rocket, ArrowRight,
} from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import StatCard from '@/components/app/StatCard'
import StatusDot from '@/components/app/StatusDot'
import { useStatus, useContainers } from '@/hooks/useApi'
import { useBunkerBalance, useStakeInfo } from '@/hooks/useContracts'
import { useRole } from '@/hooks/useRole'
import { formatUnits } from 'viem'
import { Link } from 'react-router-dom'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(used: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, (used / total) * 100)
}

function fmtPct(used: number, total: number): string {
  return `${pct(used, total).toFixed(0)}%`
}

const tierColors: Record<string, string> = {
  starter: 'text-zinc-400',
  bronze: 'text-orange-400',
  silver: 'text-zinc-300',
  gold: 'text-amber-400',
  platinum: 'text-purple-400',
}

// ─── Capacity Bar ─────────────────────────────────────────────────────────────

function CapacityBar({ label, icon: Icon, used, total, unit, delay }: {
  label: string
  icon: React.ElementType
  used: number
  total: number
  unit: string
  delay: number
}) {
  const percent = pct(used, total)
  const isHigh = percent > 80

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-400">{label}</span>
        </div>
        <span className="text-xs font-mono text-zinc-400">
          {used.toFixed(1)} / {total.toFixed(1)} {unit}
          <span className={`ml-2 ${isHigh ? 'text-red-400' : 'text-zinc-500'}`}>
            {fmtPct(used, total)}
          </span>
        </span>
      </div>
      <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
          className={`h-full rounded-full ${isHigh ? 'bg-red-500' : 'bg-red-500/80'}`}
        />
      </div>
    </div>
  )
}

// ─── Security Row ─────────────────────────────────────────────────────────────

function SecurityRow({ label, active, detail }: {
  label: string
  active: boolean
  detail?: string
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <StatusDot status={active ? 'running' : 'stopped'} />
        <span className="text-sm text-zinc-300">{label}</span>
      </div>
      <span className={`text-xs font-mono ${active ? 'text-green-400' : 'text-zinc-600'}`}>
        {detail ?? (active ? 'Active' : 'Inactive')}
      </span>
    </div>
  )
}

// ─── Shared Containers Section ────────────────────────────────────────────────

function ContainersSection({ containers, delay }: {
  containers: Array<{ id: string; status: string; image: string; encrypted?: boolean; regions?: string[] }> | undefined
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Containers</h2>
        {containers && containers.length > 0 && (
          <Link to="/app/containers" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            View all
          </Link>
        )}
      </div>
      <div className="bg-black border border-zinc-800 rounded-lg divide-y divide-zinc-800/50 overflow-hidden">
        {containers && containers.length > 0 ? (
          containers.slice(0, 5).map((ctr, i) => (
            <motion.div
              key={ctr.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.1 + i * 0.05 }}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <StatusDot status={ctr.status} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-white font-mono">{ctr.id}</p>
                    {ctr.encrypted && <Lock className="w-3 h-3 text-green-500" />}
                  </div>
                  <p className="text-xs text-zinc-500">{ctr.image}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ctr.regions?.map((r) => (
                  <span key={r} className="text-xs text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded font-mono">
                    {r}
                  </span>
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-zinc-600">
            No containers deployed yet.
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Requester Dashboard ──────────────────────────────────────────────────────

function RequesterDashboard() {
  const { address } = useAccount()
  const { data: rawBalance } = useBunkerBalance()
  const { data: containers } = useContainers()

  const bunkerBalance = rawBalance ? Math.round(Number(formatUnits(rawBalance as bigint, 18))) : 0
  const usdValue = (bunkerBalance / 20000).toLocaleString(undefined, { maximumFractionDigits: 2 })
  const activeCount = containers?.filter(c => c.status === 'running').length ?? 0

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined}
      />

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/3 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ── Balance + Quick Actions ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border border-zinc-800 rounded-lg p-5 md:col-span-2"
        >
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">BUNKER Balance</span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">
            {bunkerBalance.toLocaleString()}
          </p>
          <p className="text-sm text-zinc-500 mt-1">~${usdValue} USD</p>
        </motion.div>

        {/* Quick deploy CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            to="/app/deploy"
            className="flex flex-col items-center justify-center h-full bg-red-500/10 border border-red-500/30 rounded-lg p-5 hover:bg-red-500/15 transition-colors group"
          >
            <Rocket className="w-6 h-6 text-red-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-white">Deploy Container</span>
            <span className="text-xs text-zinc-500 mt-1">Launch on the network</span>
          </Link>
        </motion.div>
      </div>

      {/* ── Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Active Containers" value={activeCount} icon={Box} color="text-blue-400" delay={0.2} />
        <StatCard label="BUNKER Balance" value={bunkerBalance} icon={Coins} color="text-amber-400" delay={0.3} />
      </div>

      {/* ── Containers ─────────────────────────────── */}
      <ContainersSection containers={containers} delay={0.4} />

      {/* ── Earn BUNKER card (subtle on-ramp) ──────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-black border border-zinc-800 rounded-lg p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center">
              <Server className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">Want to earn BUNKER?</p>
              <p className="text-xs text-zinc-500">Host containers on your hardware and earn rewards.</p>
            </div>
          </div>
          <Link
            to="/app/provider"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors"
          >
            Learn more
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Provider Dashboard ───────────────────────────────────────────────────────

function ProviderDashboard() {
  const { address } = useAccount()
  const { data: status } = useStatus()
  const { data: containers } = useContainers()
  const { data: rawBalance } = useBunkerBalance()
  const { stake } = useStakeInfo()

  const activeCount = status?.containers ?? 0
  const bunkerBalance = rawBalance ? Math.round(Number(formatUnits(rawBalance as bigint, 18))) : 0
  const stakedAmount = stake.data ? Number(formatUnits(stake.data as bigint, 18)) : 0
  const networkNodes = status?.network_nodes ?? 0
  const uptimeStr = status?.uptime ?? '—'

  const cap = status?.network_capacity
  const sec = status?.security
  const tier = status?.node_tier ?? 'starter'
  const role = status?.node_role ?? 'hybrid'
  const reputation = status?.reputation_score ?? 0
  const knownNodes = status?.known_nodes ?? []

  const selfNode = knownNodes.length > 0 ? knownNodes[0] : undefined
  const hw = selfNode?.capacity?.hardware

  const isArmed = sec?.tls_version === '1.3' && sec?.encryption_algo === 'AES-256-GCM' && sec?.seccomp_enabled

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined}
      />

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/3 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ── Stats Grid ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Containers" value={activeCount} icon={Box} color="text-blue-400" delay={0} />
        <StatCard label="BUNKER Balance" value={bunkerBalance} icon={Coins} color="text-amber-400" delay={0.1} />
        <StatCard label="Network Nodes" value={networkNodes} icon={Users} color="text-red-400" delay={0.2} />
        <StatCard label="Uptime" value={uptimeStr} icon={Activity} color="text-green-400" delay={0.3} />
      </div>

      {/* ── Staking + Tier Card ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-black border border-red-500/30 rounded-xl p-5 relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-3 mb-4 relative">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-red-400" />
          </div>
          <div>
            <p className={`text-sm font-semibold capitalize ${tierColors[tier] ?? 'text-zinc-400'}`}>{tier} Tier</p>
            <p className="text-xs text-zinc-500 font-mono">{Math.round(stakedAmount).toLocaleString()} BUNKER staked</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-zinc-500">Reputation</p>
            <p className="text-sm text-white font-mono">{reputation} <span className="text-zinc-600">/ 1000</span></p>
          </div>
        </div>
        <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(reputation / 1000) * 100}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500"
          />
        </div>
      </motion.div>

      {/* ── Network Capacity + Security Posture ───── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Network Capacity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`bg-black border rounded-lg p-5 ${
            cap && pct(cap.cpu_used, cap.cpu_total) > 80
              ? 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]'
              : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Network Capacity</span>
            </div>
            {cap && (
              <span className="text-xs text-zinc-500 font-mono">
                {cap.online_nodes}/{cap.total_nodes} nodes online
              </span>
            )}
          </div>

          <div className="space-y-4">
            <CapacityBar label="CPU" icon={Cpu} used={cap?.cpu_used ?? 0} total={cap?.cpu_total ?? 1} unit="cores" delay={0.5} />
            <CapacityBar label="Memory" icon={MemoryStick} used={cap?.memory_used_gb ?? 0} total={cap?.memory_total_gb ?? 1} unit="GB" delay={0.6} />
            <CapacityBar label="Storage" icon={HardDrive} used={cap?.storage_used_gb ?? 0} total={cap?.storage_total_gb ?? 1} unit="GB" delay={0.7} />
          </div>

          {cap && (
            <p className="text-xs text-zinc-600 mt-4 font-mono">
              Overall: {fmtPct(
                (cap.cpu_used / Math.max(cap.cpu_total, 1) + cap.memory_used_gb / Math.max(cap.memory_total_gb, 1) + cap.storage_used_gb / Math.max(cap.storage_total_gb, 1)) / 3 * 100,
                100
              )} utilized
            </p>
          )}
        </motion.div>

        {/* Security Posture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black border border-zinc-800 rounded-lg p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Security Posture</span>
            </div>
            {isArmed && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400"
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                ARMED
              </motion.span>
            )}
          </div>

          <div className="divide-y divide-zinc-800/50">
            <SecurityRow label="TLS 1.3 Mutual Auth" active={sec?.tls_version === '1.3'} />
            <SecurityRow label="AES-256-GCM Encryption" active={sec?.encryption_algo === 'AES-256-GCM'} />
            <SecurityRow
              label="SEV-SNP Memory Encryption"
              active={sec?.sev_snp_supported ?? false}
              detail={sec?.sev_snp_active ? 'Active' : sec?.sev_snp_supported ? 'Supported' : 'Unavailable'}
            />
            <SecurityRow label="Seccomp Isolation" active={sec?.seccomp_enabled ?? false} />
            <SecurityRow label="Tor Hidden Services" active={sec?.tor_enabled ?? false} />
            <SecurityRow
              label="Certificate Pinning"
              active={(sec?.cert_pinned_peers ?? 0) > 0}
              detail={`${sec?.cert_pinned_peers ?? 0} peers`}
            />
          </div>

          {sec && sec.total_containers > 0 && (
            <div className="mt-4 pt-3 border-t border-zinc-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Encrypted Containers</span>
                <span className="text-xs font-mono text-zinc-400">
                  {sec.encrypted_containers} / {sec.total_containers}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Node Identity ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-black border border-zinc-800 rounded-lg p-5 border-l-2 border-l-red-500"
      >
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">Node Identity</span>
          {selfNode?.badges?.includes('trusted') && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 ml-auto">
              <CheckCircle className="w-3 h-3" />
              Trusted
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Node ID</p>
            <p className="text-sm text-white font-mono truncate" title={status?.node_id}>
              {status?.node_id ? `${status.node_id.slice(0, 12)}...` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Region</p>
            <p className="text-sm text-white font-mono">{status?.region || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Tier</p>
            <p className={`text-sm font-mono font-semibold capitalize ${tierColors[tier] ?? 'text-zinc-400'}`}>
              {tier}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Reputation</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-mono">{reputation}</span>
              <span className="text-xs text-zinc-600">/ 1000</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Role</p>
            <p className="text-sm text-white font-mono capitalize">{role}</p>
          </div>
        </div>

        {/* Hardware Details */}
        {hw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4 pt-4 border-t border-zinc-800/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Hardware Profile</span>

              <div className="flex items-center gap-1.5 ml-auto">
                {hw.sev_snp_supported && (
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">SEV-SNP</span>
                )}
                {hw.memory_ecc && (
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">ECC</span>
                )}
                {hw.storage_type === 'NVMe' && (
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">NVMe</span>
                )}
                {hw.tpm_version && hw.tpm_version !== 'none' && (
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">TPM {hw.tpm_version}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Cpu className="w-3 h-3 text-zinc-600" />
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Processor</p>
                </div>
                <p className="text-sm text-white font-mono leading-tight">{hw.cpu_model || '—'}</p>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {hw.cpu_cores}C / {hw.cpu_threads}T &middot; {hw.cpu_sockets}S &middot; {hw.cpu_arch}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <MemoryStick className="w-3 h-3 text-zinc-600" />
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Memory</p>
                </div>
                <p className="text-sm text-white font-mono leading-tight">
                  {hw.memory_gb} GB
                  {hw.memory_type !== 'unknown' && <span className="text-zinc-400"> {hw.memory_type}</span>}
                </p>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {hw.memory_ecc ? 'Error-Correcting' : 'Non-ECC'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <HardDrive className="w-3 h-3 text-zinc-600" />
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Storage</p>
                </div>
                <p className="text-sm text-white font-mono leading-tight">
                  {hw.storage_gb} GB
                  {hw.storage_type !== 'unknown' && <span className="text-zinc-400"> {hw.storage_type}</span>}
                </p>
                {hw.storage_model ? (
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{hw.storage_model}</p>
                ) : (
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{hw.bandwidth_mbps} Mbps network</p>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Globe className="w-3 h-3 text-zinc-600" />
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Platform</p>
                </div>
                <p className="text-sm text-white font-mono leading-tight">{hw.os_version || hw.os}</p>
                <p className="text-xs text-zinc-500 font-mono mt-0.5 truncate" title={`${hw.kernel} · ${hw.hostname}`}>
                  {hw.kernel}
                </p>
              </div>
            </div>

            {hw.hostname && (
              <div className="mt-3 pt-2 border-t border-zinc-800/30 flex items-center justify-between">
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Hostname</span>
                <span className="text-xs text-zinc-400 font-mono">{hw.hostname}</span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ── Known Nodes ─────────────────────────────── */}
      {knownNodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4.5 h-4.5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-white">Known Nodes</h2>
            <span className="text-xs text-zinc-500 font-mono ml-auto">
              {knownNodes.filter(n => n.online).length} online / {knownNodes.length} total
            </span>
          </div>
          <div className="bg-black border border-zinc-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-6 gap-4 px-4 py-2 border-b border-zinc-800/50 text-xs text-zinc-500 uppercase tracking-wider">
              <span>Status</span>
              <span>Node ID</span>
              <span>Region</span>
              <span>Tier</span>
              <span>CPU / Mem</span>
              <span>Containers</span>
            </div>
            {knownNodes.map((node, i) => (
              <motion.div
                key={node.node_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.03 }}
                className="grid grid-cols-6 gap-4 px-4 py-2.5 hover:bg-zinc-900/50 transition-colors items-center"
              >
                <div className="flex items-center gap-2">
                  {node.online ? (
                    <Wifi className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                  <span className={`text-xs font-mono ${node.online ? 'text-green-400' : 'text-zinc-600'}`}>
                    {node.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm text-white font-mono truncate" title={node.node_id}>
                    {node.node_id.slice(0, 12)}...
                  </span>
                  {node.badges?.includes('trusted') && <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                  {node.blocked && <Ban className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                </div>
                <span className="text-sm text-zinc-400 font-mono">{node.region || '—'}</span>
                <span className={`text-sm font-mono capitalize ${tierColors[node.tier] ?? 'text-zinc-400'}`}>
                  {node.tier || '—'}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {node.capacity.cpu_cores}c / {node.capacity.memory_gb}G
                </span>
                <span className="text-sm text-zinc-400 font-mono">{node.active_containers}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Containers ─────────────────────────────── */}
      <ContainersSection containers={containers} delay={0.7} />
    </div>
  )
}

// ─── Overview (root) ──────────────────────────────────────────────────────────

export default function Overview() {
  const role = useRole()
  if (role === 'provider') return <ProviderDashboard />
  return <RequesterDashboard />
}
