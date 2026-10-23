import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, Cpu, MemoryStick, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import StatCard from '@/components/app/StatCard'
import { useContainerMetrics } from '@/hooks/useApi'
import type { ContainerMetricSample } from '@/lib/api'

// Metrics surfaced prominently as StatCards (in this order, when present).
// The *_total entries are Prometheus counters (monotonic since container start),
// so they are labelled "(total)" to make clear they are lifetime cumulative
// values rather than a current per-interval rate.
const PROMINENT: { name: string; label: string; icon: LucideIcon; format: (v: number) => string }[] = [
  { name: 'container_cpu_usage_seconds_total', label: 'CPU Time (total)', icon: Cpu, format: formatSeconds },
  { name: 'container_memory_usage_bytes', label: 'Memory', icon: MemoryStick, format: formatBytes },
  { name: 'container_network_receive_bytes_total', label: 'Net In (total)', icon: ArrowDownToLine, format: formatBytes },
  { name: 'container_network_transmit_bytes_total', label: 'Net Out (total)', icon: ArrowUpFromLine, format: formatBytes },
]

const numberFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${numberFmt.format(bytes / Math.pow(1024, i))} ${units[i]}`
}

function formatSeconds(s: number): string {
  if (s < 60) return `${numberFmt.format(s)}s`
  if (s < 3600) return `${numberFmt.format(s / 60)}m`
  return `${numberFmt.format(s / 3600)}h`
}

/** Build a stable key for a sample including its labels. */
function sampleKey(s: ContainerMetricSample): string {
  const labels = Object.entries(s.labels)
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join(',')
  return labels ? `${s.name}{${labels}}` : s.name
}

function MetricsPlaceholder() {
  return (
    <div className="bg-black border border-zinc-800 rounded-lg px-4 py-12 text-center">
      <p className="text-sm text-zinc-500">Container metrics coming soon.</p>
      <p className="text-xs text-zinc-600 mt-1">Enable <span className="font-mono">/v1/metrics</span> on the daemon.</p>
    </div>
  )
}

export default function ContainerMetricsTab({ containerId }: { containerId: string }) {
  const { data, isLoading, isError } = useContainerMetrics(containerId)

  const { prominent, rest } = useMemo(() => {
    const samples = data ?? []
    const byName = new Map<string, ContainerMetricSample>()
    for (const s of samples) {
      // first occurrence (unlabeled / aggregate) wins for prominent lookup
      if (!byName.has(s.name)) byName.set(s.name, s)
    }
    const prominentNames = new Set(PROMINENT.map((p) => p.name))
    const prominent = PROMINENT.map((p) => ({ ...p, sample: byName.get(p.name) })).filter(
      (p): p is typeof p & { sample: ContainerMetricSample } => !!p.sample,
    )
    const rest = samples.filter((s) => !prominentNames.has(s.name))
    return { prominent, rest }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-black border border-red-900/50 rounded-lg px-4 py-12 text-center">
        <p className="text-sm text-red-400">Failed to load metrics.</p>
        <p className="text-xs text-zinc-600 mt-1">The daemon metrics endpoint returned an error.</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <MetricsPlaceholder />
  }

  return (
    <div className="space-y-4">
      {prominent.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {prominent.map((p, i) => (
            <StatCard
              key={p.name}
              label={p.label}
              value={p.format(p.sample.value)}
              icon={p.icon}
              delay={i * 0.04}
            />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rest.map((s, i) => (
            <motion.div
              key={sampleKey(s)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (prominent.length + i) * 0.04 }}
              className="bg-black border border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-zinc-500 uppercase tracking-wider truncate" title={s.help || s.name}>
                  {s.help || s.name}
                </p>
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] text-zinc-500 uppercase tracking-wider">
                  <Activity className="w-3 h-3" />
                  {s.type}
                </span>
              </div>
              <p className="text-lg text-white mt-1 font-mono">{numberFmt.format(s.value)}</p>
              {Object.keys(s.labels).length > 0 && (
                <p className="text-[11px] text-zinc-600 mt-1 font-mono truncate" title={JSON.stringify(s.labels)}>
                  {Object.entries(s.labels).map(([k, v]) => `${k}="${v}"`).join(' ')}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
