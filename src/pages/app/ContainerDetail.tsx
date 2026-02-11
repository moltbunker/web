import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Square, Trash2, Copy, Check } from 'lucide-react'
import StatusDot from '@/components/app/StatusDot'
import TerminalLog from '@/components/app/TerminalLog'
import { useContainer, useContainerLogs, useStopContainer, useDeleteContainer } from '@/hooks/useApi'
import type { LogEntry } from '@/lib/api'

const tabs = ['Overview', 'Logs', 'Metrics'] as const
type Tab = (typeof tabs)[number]

// Mock fallback data
const mockInfo = {
  id: '', image: 'nginx:1.25-alpine', status: 'running' as const, created_at: '2026-02-06T08:00:00Z',
  encrypted: true, regions: ['americas', 'europe', 'asia_pacific'],
}

const mockLogs: LogEntry[] = [
  { timestamp: '2026-02-10T12:00:01Z', level: 'info', message: 'Container started' },
  { timestamp: '2026-02-10T12:00:02Z', level: 'info', message: 'Listening on 0.0.0.0:8080' },
  { timestamp: '2026-02-10T12:01:15Z', level: 'info', message: 'Health check passed' },
  { timestamp: '2026-02-10T12:05:32Z', level: 'info', message: 'Request processed in 12ms' },
  { timestamp: '2026-02-10T12:10:00Z', level: 'info', message: 'Health check passed' },
  { timestamp: '2026-02-10T12:15:44Z', level: 'warn', message: 'High memory usage: 78%' },
  { timestamp: '2026-02-10T12:20:00Z', level: 'info', message: 'Health check passed' },
]

const mockMetrics = [
  { label: 'CPU Usage', value: '23%', bar: 23, color: 'bg-blue-500' },
  { label: 'Memory Usage', value: '78%', bar: 78, color: 'bg-amber-500' },
  { label: 'Network In', value: '1.2 MB/s', bar: 40, color: 'bg-green-500' },
  { label: 'Network Out', value: '0.8 MB/s', bar: 27, color: 'bg-green-500' },
  { label: 'Disk I/O Read', value: '12 MB/s', bar: 30, color: 'bg-red-500' },
  { label: 'Disk I/O Write', value: '4 MB/s', bar: 10, color: 'bg-red-500' },
]

export default function ContainerDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const { data: container } = useContainer(id ?? '')
  const { data: logs } = useContainerLogs(id ?? '')
  const stopMutation = useStopContainer()
  const deleteMutation = useDeleteContainer()

  const info = container ?? { ...mockInfo, id: id ?? '' }
  const logLines = logs ?? mockLogs

  const copyId = () => {
    navigator.clipboard.writeText(id ?? '')
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/app/containers" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono">{id}</h1>
            <button onClick={copyId} className="p-1 text-zinc-500 hover:text-white transition-colors">
              {copiedId ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <StatusDot status={info.status} showLabel />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => id && stopMutation.mutate(id)}
            disabled={info.status === 'stopped' || stopMutation.isPending}
            className="flex items-center gap-2 px-3 py-2 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 disabled:opacity-40 rounded-lg text-sm transition-all"
          >
            <Square className="w-4 h-4" />
            Stop
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 border border-red-900 text-red-400 hover:text-red-300 hover:border-red-700 rounded-lg text-sm transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
      />

      {/* Tabs */}
      <div className="border-b border-zinc-800">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="detailTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'Overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {[
              ['Image', info.image],
              ['Status', info.status],
              ['Encrypted', info.encrypted ? 'Yes (AES-256-GCM)' : 'No'],
              ['Regions', info.regions?.join(', ') ?? '—'],
              ['Replicas', `${info.regions?.length ?? 0}/3`],
              ['Created', new Date(info.created_at).toLocaleString()],
              ['Onion', info.onion_address ?? 'N/A'],
            ].map(([label, value], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-black border border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-700 transition-colors"
              >
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
                <p className="text-sm text-white mt-1 font-mono">{value}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'Logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <TerminalLog
              title={`${id} logs`}
              lines={logLines}
              maxHeight="500px"
            />
          </motion.div>
        )}

        {activeTab === 'Metrics' && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {mockMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-black border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-zinc-400">{metric.label}</span>
                  <span className="text-white font-mono">{metric.value}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.bar}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                    className={`${metric.color} h-2 rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm mx-4"
            >
              <h3 className="text-lg font-bold text-white mb-2">Delete Container</h3>
              <p className="text-sm text-zinc-400 mb-6">
                This will permanently delete <span className="font-mono text-white">{id}</span> and all associated replicas. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (id) deleteMutation.mutate(id)
                    setShowDeleteConfirm(false)
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
