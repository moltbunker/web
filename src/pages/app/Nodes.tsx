import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, Cpu, MemoryStick, HardDrive, Server, Shield, Wifi, WifiOff,
  Copy, Check, CheckCircle, Ban, ChevronDown, Box,
} from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import StatCard from '@/components/app/StatCard'
import { useStatus } from '@/hooks/useApi'
import type { NodeProfile, HardwareProfile } from '@/lib/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const tierColors: Record<string, string> = {
  starter: 'text-zinc-400',
  bronze: 'text-orange-400',
  silver: 'text-zinc-300',
  gold: 'text-amber-400',
  platinum: 'text-purple-400',
}

const tierBg: Record<string, string> = {
  starter: 'bg-zinc-500/10 border-zinc-500/20',
  bronze: 'bg-orange-500/10 border-orange-500/20',
  silver: 'bg-zinc-400/10 border-zinc-400/20',
  gold: 'bg-amber-500/10 border-amber-500/20',
  platinum: 'bg-purple-500/10 border-purple-500/20',
}

const countryFlags: Record<string, string> = {
  FR: '\u{1F1EB}\u{1F1F7}',
  DE: '\u{1F1E9}\u{1F1EA}',
  US: '\u{1F1FA}\u{1F1F8}',
  GB: '\u{1F1EC}\u{1F1E7}',
  NL: '\u{1F1F3}\u{1F1F1}',
  FI: '\u{1F1EB}\u{1F1EE}',
  CA: '\u{1F1E8}\u{1F1E6}',
  JP: '\u{1F1EF}\u{1F1F5}',
  SG: '\u{1F1F8}\u{1F1EC}',
  AU: '\u{1F1E6}\u{1F1FA}',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-1 rounded hover:bg-zinc-700/50 transition-colors ${className}`}
      title="Copy Node ID"
    >
      {copied ? (
        <Check className="w-3 h-3 text-green-400" />
      ) : (
        <Copy className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
      )}
    </button>
  )
}

// ─── Reputation Bar ───────────────────────────────────────────────────────────

function ReputationBar({ score, size = 'sm' }: { score: number; size?: 'sm' | 'md' }) {
  const pct = Math.min(100, (score / 1000) * 100)
  const h = size === 'md' ? 'h-1.5' : 'h-1'

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${h} bg-zinc-800 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            score >= 800 ? 'bg-green-500' : score >= 500 ? 'bg-amber-500' : 'bg-red-500'
          }`}
        />
      </div>
      <span className="text-xs font-mono text-zinc-400 tabular-nums w-12 text-right">
        {score}<span className="text-zinc-600">/1k</span>
      </span>
    </div>
  )
}

// ─── Hardware Badge ───────────────────────────────────────────────────────────

function HwBadge({ label, active, color }: { label: string; active: boolean; color: string }) {
  if (!active) return null
  return (
    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${color}`}>
      {label}
    </span>
  )
}

// ─── Hardware Detail Panel ────────────────────────────────────────────────────

function HardwareDetail({ hw }: { hw: HardwareProfile }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="pt-3 mt-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-2 mb-3">
          <Server className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Hardware Profile</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <HwBadge label="SEV-SNP" active={hw.sev_snp_supported} color="bg-red-500/10 border border-red-500/20 text-red-400" />
            <HwBadge label="ECC" active={hw.memory_ecc} color="bg-blue-500/10 border border-blue-500/20 text-blue-400" />
            <HwBadge label="NVMe" active={hw.storage_type === 'NVMe'} color="bg-purple-500/10 border border-purple-500/20 text-purple-400" />
            <HwBadge label={`TPM ${hw.tpm_version}`} active={!!hw.tpm_version && hw.tpm_version !== 'none'} color="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Cpu className="w-3 h-3 text-zinc-600" />
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Processor</p>
            </div>
            <p className="text-sm text-white font-mono leading-tight">{hw.cpu_model || '\u2014'}</p>
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
              <p className="text-xs text-zinc-500 font-mono mt-0.5">{hw.bandwidth_mbps} Mbps</p>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Globe className="w-3 h-3 text-zinc-600" />
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Platform</p>
            </div>
            <p className="text-sm text-white font-mono leading-tight">{hw.os_version || hw.os}</p>
            <p className="text-xs text-zinc-500 font-mono mt-0.5 truncate" title={hw.kernel}>
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
      </div>
    </motion.div>
  )
}

// ─── Self Node Hero ───────────────────────────────────────────────────────────

function SelfNodeHero({ node, status }: {
  node: NodeProfile
  status: { uptime: string; version: string; node_role?: string; node_tier?: string; reputation_score?: number }
}) {
  const hw = node.capacity?.hardware
  const tier = status.node_tier || node.tier || 'starter'
  const reputation = status.reputation_score ?? node.reputation_score

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-black border border-zinc-800 rounded-xl p-6 border-l-2 border-l-red-500 relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header row */}
      <div className="flex items-start justify-between mb-5 relative">
        <div className="flex items-center gap-2 min-w-0">
          <Shield className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-white font-mono truncate" title={node.node_id}>
            {node.node_id}
          </p>
          <CopyButton text={node.node_id} />
          {node.badges?.includes('trusted') && (
            <span
              title="Admin-verified trusted node"
              className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 cursor-help shrink-0"
            >
              <CheckCircle className="w-3 h-3" />
              Trusted
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold capitalize px-2 py-1 rounded border ${tierBg[tier] ?? tierBg.starter} ${tierColors[tier] ?? tierColors.starter}`}>
            {tier}
          </span>
          <Wifi className="w-4 h-4 text-green-500" />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Region</p>
          <p className="text-sm text-white font-mono">
            {node.country && countryFlags[node.country] ? `${countryFlags[node.country]} ` : ''}
            {node.region || '\u2014'}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Role</p>
          <p className="text-sm text-white font-mono capitalize">{status.node_role || node.role || '\u2014'}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Version</p>
          <p className="text-sm text-white font-mono">{node.version || status.version || '\u2014'}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Uptime</p>
          <p className="text-sm text-white font-mono">{status.uptime}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Containers</p>
          <p className="text-sm text-white font-mono">{node.active_containers}</p>
        </div>
      </div>

      {/* Reputation */}
      <div className="mb-5">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Reputation</p>
        <ReputationBar score={reputation} size="md" />
      </div>

      {/* Hardware profile */}
      {hw && <HardwareDetail hw={hw} />}
    </motion.div>
  )
}

// ─── Node Card ────────────────────────────────────────────────────────────────

function NodeCard({ node, index }: { node: NodeProfile; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const tier = node.tier || 'starter'
  const hw = node.capacity?.hardware
  const hasDetail = !!hw

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.03 }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.08)' }}
      onClick={() => hasDetail && setExpanded(!expanded)}
      className={`bg-black border border-zinc-800 rounded-lg p-4 transition-all ${
        hasDetail ? 'cursor-pointer' : ''
      } ${node.blocked ? 'border-red-500/20' : ''}`}
    >
      {/* Top row: status + node ID + tier */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {node.online ? (
            <Wifi className="w-3.5 h-3.5 text-green-500 shrink-0" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          )}
          <span className="text-sm text-white font-mono truncate" title={node.node_id}>
            {node.node_id.slice(0, 12)}...
          </span>
          <CopyButton text={node.node_id} />
          {node.badges?.includes('trusted') && (
            <span title="Admin-verified trusted node" className="shrink-0 cursor-help">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            </span>
          )}
          {node.blocked && (
            <span title="This peer has been banned" className="shrink-0 cursor-help">
              <Ban className="w-3.5 h-3.5 text-red-500" />
            </span>
          )}
        </div>
        <span className={`text-[10px] font-mono font-semibold capitalize px-1.5 py-0.5 rounded border shrink-0 ${tierBg[tier] ?? tierBg.starter} ${tierColors[tier] ?? tierColors.starter}`}>
          {tier}
        </span>
      </div>

      {/* Region + last seen */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-400 font-mono">
          {node.country && countryFlags[node.country] ? `${countryFlags[node.country]} ` : ''}
          {node.region || '\u2014'}
        </span>
        <span className={`text-[10px] ${node.online ? 'text-green-400' : 'text-zinc-600'}`}>
          {node.online ? 'Online' : node.last_seen ? timeAgo(node.last_seen) : 'Unknown'}
        </span>
      </div>

      {/* Capacity row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-zinc-600" />
          <span className="text-xs text-zinc-400 font-mono">{node.capacity.cpu_cores}c</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MemoryStick className="w-3 h-3 text-zinc-600" />
          <span className="text-xs text-zinc-400 font-mono">{node.capacity.memory_gb}G</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-3 h-3 text-zinc-600" />
          <span className="text-xs text-zinc-400 font-mono">{node.capacity.storage_gb}G</span>
        </div>
      </div>

      {/* Containers + Reputation */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Box className="w-3 h-3 text-zinc-600" />
          <span className="text-xs text-zinc-400">{node.active_containers} containers</span>
        </div>
        {hasDetail && (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
          </motion.div>
        )}
      </div>

      <ReputationBar score={node.reputation_score} />

      {/* Expandable hardware */}
      <AnimatePresence>
        {expanded && hw && <HardwareDetail hw={hw} />}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Nodes() {
  const { data: status, isLoading } = useStatus()

  const knownNodes = status?.known_nodes ?? []
  const selfNode = knownNodes.length > 0 ? knownNodes[0] : undefined
  const peerNodes = knownNodes.slice(1)

  // Sort: online first, then by reputation descending
  const sortedPeers = [...peerNodes].sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1
    return b.reputation_score - a.reputation_score
  })

  const cap = status?.network_capacity
  const onlineCount = knownNodes.filter(n => n.online).length
  const totalCpu = knownNodes.reduce((sum, n) => sum + n.capacity.cpu_cores, 0)
  const totalMem = knownNodes.reduce((sum, n) => sum + n.capacity.memory_gb, 0)
  const totalStorage = knownNodes.reduce((sum, n) => sum + n.capacity.storage_gb, 0)

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Nodes" subtitle="Network node browser" />
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nodes"
        subtitle={`${onlineCount} online / ${knownNodes.length} total`}
      />

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/3 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Self Node Hero */}
      {selfNode && status && (
        <SelfNodeHero
          node={selfNode}
          status={{
            uptime: status.uptime,
            version: status.version,
            node_role: status.node_role,
            node_tier: status.node_tier,
            reputation_score: status.reputation_score,
          }}
        />
      )}

      {/* Network Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Online Nodes"
          value={cap?.online_nodes ?? onlineCount}
          icon={Wifi}
          color="text-green-400"
          delay={0.1}
        />
        <StatCard
          label="Total CPU"
          value={totalCpu}
          icon={Cpu}
          color="text-blue-400"
          suffix=" cores"
          delay={0.15}
        />
        <StatCard
          label="Total Memory"
          value={totalMem}
          icon={MemoryStick}
          color="text-purple-400"
          suffix=" GB"
          delay={0.2}
        />
        <StatCard
          label="Total Storage"
          value={totalStorage}
          icon={HardDrive}
          color="text-amber-400"
          suffix=" GB"
          delay={0.25}
        />
      </div>

      {/* Known Nodes Grid */}
      {sortedPeers.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4.5 h-4.5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-white">Network Nodes</h2>
            <span className="text-xs text-zinc-500 font-mono ml-auto">
              {sortedPeers.filter(n => n.online).length} online
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPeers.map((node, i) => (
              <NodeCard key={node.node_id} node={node} index={i} />
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-black border border-zinc-800 rounded-lg p-8 text-center"
        >
          <Globe className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No peer nodes discovered yet.</p>
          <p className="text-xs text-zinc-600 mt-1">Nodes will appear as the network grows.</p>
        </motion.div>
      )}
    </div>
  )
}
