import { useState, lazy, Suspense } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Square, Trash2, Copy, Check, Play } from 'lucide-react'
import StatusDot from '@/components/app/StatusDot'
import TerminalLog from '@/components/app/TerminalLog'
import { useContainer, useContainerLogs, useStopContainer, useStartContainer, useDeleteContainer } from '@/hooks/useApi'

const Terminal = lazy(() => import('@/components/app/Terminal'))

const allTabs = ['Overview', 'Logs', 'Metrics', 'Terminal'] as const
type Tab = (typeof allTabs)[number]

export default function ContainerDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const initialTab = allTabs.includes(searchParams.get('tab') as Tab) ? (searchParams.get('tab') as Tab) : 'Overview'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const { data: container, isLoading } = useContainer(id ?? '')
  const { data: logs = [] } = useContainerLogs(id ?? '')
  const stopMutation = useStopContainer()
  const startMutation = useStartContainer()
  const deleteMutation = useDeleteContainer()

  if (isLoading || !container) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
      </div>
    )
  }

  const info = container
  const logLines = logs
  const tabs = info.status === 'running' ? allTabs : allTabs.filter(t => t !== 'Terminal')

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
          {info.status === 'running' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => id && stopMutation.mutate(id)}
              disabled={stopMutation.isPending}
              className="btn-action"
            >
              <Square className="w-4 h-4" />
              {stopMutation.isPending ? 'Stopping...' : 'Stop'}
            </motion.button>
          )}
          {info.status === 'stopped' && info.has_volume && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => id && startMutation.mutate(id)}
              disabled={startMutation.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {startMutation.isPending ? 'Starting...' : 'Start'}
            </motion.button>
          )}
          {info.status === 'stopped' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-action"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </motion.button>
          )}
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
          >
            <div className="bg-black border border-zinc-800 rounded-lg px-4 py-12 text-center">
              <p className="text-sm text-zinc-500">Container metrics coming soon.</p>
              <p className="text-xs text-zinc-600 mt-1">Prometheus integration pending.</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'Terminal' && (
          <motion.div
            key="terminal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mr-3" />
                Loading terminal...
              </div>
            }>
              <Terminal containerID={id ?? ''} />
            </Suspense>
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
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (id) deleteMutation.mutate(id)
                    setShowDeleteConfirm(false)
                  }}
                  className="btn-action flex-1 justify-center"
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
