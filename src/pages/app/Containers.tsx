import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Rocket, Square, Trash2, TerminalSquare,
  FileText, Copy, Camera, X, Loader2, Play,
} from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import StatusDot from '@/components/app/StatusDot'
import TerminalLog from '@/components/app/TerminalLog'
import {
  useContainers, useContainerLogs,
  useStopContainer, useStartContainer, useDeleteContainer, useClone, useCreateSnapshot,
} from '@/hooks/useApi'
import type { ContainerInfo } from '@/lib/api'

const statusFilters = ['all', 'running', 'deploying', 'stopped', 'failed'] as const

// ─── Action Button ──────────────────────────────────────────────────────────

function ActionBtn({
  icon: Icon, label, onClick, variant = 'default', loading = false, disabled = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: 'default' | 'danger'
  loading?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); onClick(e) }}
      disabled={disabled || loading}
      title={label}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-40 ${
        variant === 'danger'
          ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
          : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
      }`}
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <Icon className="w-3.5 h-3.5" />}
    </button>
  )
}

// ─── Stats Bar ──────────────────────────────────────────────────────────────

function StatsBar({ containers }: { containers: ContainerInfo[] }) {
  const running = containers.filter(c => c.status === 'running').length
  const stopped = containers.filter(c => c.status === 'stopped').length
  const failed = containers.filter(c => c.status === 'failed').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex gap-4 text-sm"
    >
      <span className="text-zinc-400">
        <span className="text-white font-medium">{containers.length}</span> total
      </span>
      <span className="text-zinc-400">
        <span className="text-green-400 font-medium">{running}</span> running
      </span>
      <span className="text-zinc-400">
        <span className="text-zinc-500 font-medium">{stopped}</span> stopped
      </span>
      {failed > 0 && (
        <span className="text-zinc-400">
          <span className="text-red-400 font-medium">{failed}</span> failed
        </span>
      )}
    </motion.div>
  )
}

// ─── Confirmation Modal ─────────────────────────────────────────────────────

function ConfirmModal({
  title, description, confirmLabel, onConfirm, onCancel, loading,
}: {
  title: string
  description: React.ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm mx-4"
      >
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <div className="text-sm text-zinc-400 mb-6">{description}</div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            disabled={loading}
            className="btn-action flex-1 justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Logs Panel ─────────────────────────────────────────────────────────────

function LogsPanel({ containerId, onClose }: { containerId: string; onClose: () => void }) {
  const { data: logs = [] } = useContainerLogs(containerId)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-zinc-950 border-l border-zinc-800 flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-white">Logs</span>
            <span className="text-xs font-mono text-zinc-500">{containerId}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          <TerminalLog
            title={`${containerId} logs`}
            lines={logs}
            maxHeight="100%"
            className="h-full"
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Volume Retention ────────────────────────────────────────────────────────

function formatRetention(expiresAt: string | undefined): { label: string; color: string } | null {
  if (!expiresAt) return null
  const remaining = new Date(expiresAt).getTime() - Date.now()
  if (remaining <= 0) return { label: 'expired', color: 'text-zinc-600' }
  const hours = remaining / (1000 * 60 * 60)
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const h = Math.floor(hours % 24)
    return { label: `${days}d ${h}h`, color: 'text-green-500' }
  }
  if (hours >= 4) {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return { label: `${h}h ${m}m`, color: 'text-amber-500' }
  }
  const h = Math.floor(hours)
  const m = Math.floor((hours - h) * 60)
  return { label: h > 0 ? `${h}h ${m}m` : `${m}m`, color: 'text-red-500' }
}

function VolumeRetention({ expiresAt }: { expiresAt?: string }) {
  const ret = formatRetention(expiresAt)
  if (!ret) return null
  return (
    <span className={`text-[10px] ${ret.color}`}>
      Vol: {ret.label}
    </span>
  )
}

// ─── Row Actions ────────────────────────────────────────────────────────────

function RowActions({
  ctr,
  onStop, onStart, onDelete, onLogs, onClone, onSnapshot, onTerminal,
  stoppingId, startingId, deletingId, cloningId, snapshottingId,
}: {
  ctr: ContainerInfo
  onStop: (id: string) => void
  onStart: (id: string) => void
  onDelete: (id: string) => void
  onLogs: (id: string) => void
  onClone: (id: string) => void
  onSnapshot: (id: string) => void
  onTerminal: (id: string) => void
  stoppingId: string | null
  startingId: string | null
  deletingId: string | null
  cloningId: string | null
  snapshottingId: string | null
}) {
  const isRunning = ctr.status === 'running'
  const isStopped = ctr.status === 'stopped'
  const isFailed = ctr.status === 'failed'

  return (
    <div className="flex items-center gap-0.5">
      {isRunning && (
        <ActionBtn
          icon={Square}
          label="Stop"
          onClick={() => onStop(ctr.id)}
          variant="danger"
          loading={stoppingId === ctr.id}
        />
      )}
      {isStopped && ctr.has_volume && (
        <ActionBtn
          icon={Play}
          label="Start"
          onClick={() => onStart(ctr.id)}
          loading={startingId === ctr.id}
        />
      )}
      {(isStopped || isFailed) && (
        <ActionBtn
          icon={Trash2}
          label="Delete"
          onClick={() => onDelete(ctr.id)}
          variant="danger"
          loading={deletingId === ctr.id}
        />
      )}
      {isRunning && (
        <ActionBtn
          icon={TerminalSquare}
          label="Terminal"
          onClick={() => onTerminal(ctr.id)}
        />
      )}
      <ActionBtn
        icon={FileText}
        label="Logs"
        onClick={() => onLogs(ctr.id)}
      />
      {isRunning && (
        <>
          <ActionBtn
            icon={Copy}
            label="Clone"
            onClick={() => onClone(ctr.id)}
            loading={cloningId === ctr.id}
          />
          <ActionBtn
            icon={Camera}
            label="Snapshot"
            onClick={() => onSnapshot(ctr.id)}
            loading={snapshottingId === ctr.id}
          />
        </>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function Containers() {
  const navigate = useNavigate()
  const { data: containers = [] } = useContainers()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Modal state
  const [confirmAction, setConfirmAction] = useState<{ type: 'stop' | 'delete'; id: string } | null>(null)

  // Logs panel
  const [logsContainerId, setLogsContainerId] = useState<string | null>(null)

  // Per-row loading (track which container is being acted on)
  const [actionFeedback, setActionFeedback] = useState<{ id: string; message: string; ok: boolean } | null>(null)

  // Mutations
  const stopMutation = useStopContainer()
  const startMutation = useStartContainer()
  const deleteMutation = useDeleteContainer()
  const cloneMutation = useClone()
  const snapshotMutation = useCreateSnapshot()

  const filtered = containers.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (search && !c.id.includes(search) && !c.image.includes(search)) return false
    return true
  })

  const showFeedback = useCallback((id: string, message: string, ok: boolean) => {
    setActionFeedback({ id, message, ok })
    setTimeout(() => setActionFeedback(null), 2500)
  }, [])

  // Action handlers
  const handleStop = (id: string) => setConfirmAction({ type: 'stop', id })
  const handleDelete = (id: string) => setConfirmAction({ type: 'delete', id })
  const handleStart = (id: string) => {
    startMutation.mutate(id, {
      onSuccess: () => showFeedback(id, 'Started', true),
      onError: () => showFeedback(id, 'Start failed', false),
    })
  }

  const handleConfirm = () => {
    if (!confirmAction) return
    const { type, id } = confirmAction
    if (type === 'stop') {
      stopMutation.mutate(id, {
        onSuccess: () => showFeedback(id, 'Stopped', true),
        onError: () => showFeedback(id, 'Stop failed', false),
      })
    } else {
      deleteMutation.mutate(id, {
        onSuccess: () => showFeedback(id, 'Deleted', true),
        onError: () => showFeedback(id, 'Delete failed', false),
      })
    }
    setConfirmAction(null)
  }

  const handleClone = (id: string) => {
    cloneMutation.mutate({ code_hash: id, reason: 'manual-clone' }, {
      onSuccess: () => showFeedback(id, 'Clone started', true),
      onError: () => showFeedback(id, 'Clone failed', false),
    })
  }

  const handleSnapshot = (id: string) => {
    snapshotMutation.mutate({ container_id: id, type: 'full' }, {
      onSuccess: () => showFeedback(id, 'Snapshot created', true),
      onError: () => showFeedback(id, 'Snapshot failed', false),
    })
  }

  const handleTerminal = (id: string) => navigate(`/app/containers/${id}?tab=Terminal`)

  // Track which specific container is loading for each mutation
  const stoppingId = stopMutation.isPending ? (stopMutation.variables ?? null) : null
  const startingId = startMutation.isPending ? (startMutation.variables ?? null) : null
  const deletingId = deleteMutation.isPending ? (deleteMutation.variables ?? null) : null
  const cloningId = cloneMutation.isPending ? (cloneMutation.variables as { code_hash?: string } | undefined)?.code_hash ?? null : null
  const snapshottingId = snapshotMutation.isPending ? (snapshotMutation.variables as { container_id?: string } | undefined)?.container_id ?? null : null

  const actionProps = {
    onStop: handleStop,
    onStart: handleStart,
    onDelete: handleDelete,
    onLogs: setLogsContainerId,
    onClone: handleClone,
    onSnapshot: handleSnapshot,
    onTerminal: handleTerminal,
    stoppingId,
    startingId,
    deletingId,
    cloningId,
    snapshottingId,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Containers"
        action={
          <Link to="/app/deploy" className="btn-action">
            <Rocket className="w-4 h-4" />
            Deploy New
          </Link>
        }
      />

      {/* Stats bar */}
      {containers.length > 0 && <StatsBar containers={containers} />}

      {/* Search + Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID or image..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
          />
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {statusFilters.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Inline action feedback toast */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-sm font-medium px-4 py-2 rounded-lg border ${
              actionFeedback.ok
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <span className="font-mono">{actionFeedback.id}</span> — {actionFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop table */}
      <div className="hidden md:block">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black border border-zinc-800 rounded-lg overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Regions</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((ctr, i) => (
                <motion.tr
                  key={ctr.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link to={`/app/containers/${ctr.id}`} className="text-sm font-mono text-blue-400 hover:text-blue-300 transition-colors">
                      {ctr.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300 font-mono truncate max-w-[200px]">{ctr.image}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <StatusDot status={ctr.status} showLabel />
                      {ctr.status === 'stopped' && <VolumeRetention expiresAt={ctr.volume_expires_at} />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {ctr.regions?.join(', ') ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 text-right font-mono">
                    {new Date(ctr.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end">
                      <RowActions ctr={ctr} {...actionProps} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Empty states */}
          {filtered.length === 0 && containers.length > 0 && (
            <div className="px-4 py-8 text-center text-sm text-zinc-600">
              No containers match your filters.
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((ctr, i) => (
          <motion.div
            key={ctr.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-black border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
          >
            <Link to={`/app/containers/${ctr.id}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-blue-400">{ctr.id}</span>
                <div className="flex flex-col items-end gap-0.5">
                  <StatusDot status={ctr.status} showLabel />
                  {ctr.status === 'stopped' && <VolumeRetention expiresAt={ctr.volume_expires_at} />}
                </div>
              </div>
              <p className="text-xs text-zinc-400 font-mono truncate">{ctr.image}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-zinc-600">{ctr.regions?.join(', ')}</span>
                <span className="text-xs text-zinc-600">{new Date(ctr.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </Link>
            <div className="mt-3 pt-3 border-t border-zinc-800/50 flex justify-end">
              <RowActions ctr={ctr} {...actionProps} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state — no containers at all */}
      {containers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border border-zinc-800 rounded-xl p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-5 h-5 text-zinc-600" />
          </div>
          <h3 className="text-white font-medium mb-1">No containers yet</h3>
          <p className="text-sm text-zinc-500 mb-5 max-w-xs mx-auto">
            Deploy your first container to the Moltbunker network. It will be encrypted and replicated across 3 regions.
          </p>
          <Link to="/app/deploy" className="btn-action inline-flex">
            <Rocket className="w-4 h-4" />
            Deploy Container
          </Link>
        </motion.div>
      )}

      {/* Confirmation modal */}
      <AnimatePresence>
        {confirmAction?.type === 'stop' && (
          <ConfirmModal
            title="Stop Container"
            description={
              <p>
                Stop <span className="font-mono text-white">{confirmAction.id}</span>? The container will be gracefully stopped across all replicas.
              </p>
            }
            confirmLabel="Stop"
            onConfirm={handleConfirm}
            onCancel={() => setConfirmAction(null)}
          />
        )}
        {confirmAction?.type === 'delete' && (
          <ConfirmModal
            title="Delete Container"
            description={
              <p>
                Permanently delete <span className="font-mono text-white">{confirmAction.id}</span> and all associated replicas? This cannot be undone.
              </p>
            }
            confirmLabel="Delete"
            onConfirm={handleConfirm}
            onCancel={() => setConfirmAction(null)}
            loading={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Logs slide-out panel */}
      <AnimatePresence>
        {logsContainerId && (
          <LogsPanel
            containerId={logsContainerId}
            onClose={() => setLogsContainerId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
