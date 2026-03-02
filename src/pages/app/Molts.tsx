import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Search, Square, Trash2, X, Loader2, Plus } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import StatusDot from '@/components/app/StatusDot'
import { useMolts, useDeployMolt, useStopMolt, useDeleteMolt } from '@/hooks/useApi'
import type { MoltDeployment, MoltSpec, MoltRuntimeType } from '@/lib/api'

const statusFilters = ['all', 'running', 'stopped', 'failed'] as const

function StatsBar({ molts }: { molts: MoltDeployment[] }) {
  const running = molts.filter(m => m.status === 'running').length
  const stopped = molts.filter(m => m.status === 'stopped').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex gap-4 text-sm"
    >
      <span className="text-zinc-400">
        <span className="text-white font-medium">{molts.length}</span> total
      </span>
      <span className="text-zinc-400">
        <span className="text-green-400 font-medium">{running}</span> running
      </span>
      <span className="text-zinc-400">
        <span className="text-zinc-500 font-medium">{stopped}</span> stopped
      </span>
    </motion.div>
  )
}

function DeployModal({ onClose }: { onClose: () => void }) {
  const deployMolt = useDeployMolt()
  const [runtime, setRuntime] = useState<MoltRuntimeType>('wasm')
  const [name, setName] = useState('')
  const [moduleCid, setModuleCid] = useState('')
  const [entryPoint, setEntryPoint] = useState('')
  const [memoryLimit, setMemoryLimit] = useState('64')
  const [timeout, setTimeout] = useState('30000')
  const [envText, setEnvText] = useState('')
  const [allowedHosts, setAllowedHosts] = useState('')

  const handleDeploy = () => {
    const env: Record<string, string> = {}
    envText.split('\n').filter(Boolean).forEach(line => {
      const [k, ...v] = line.split('=')
      if (k) env[k.trim()] = v.join('=').trim()
    })

    const spec: MoltSpec = {
      name,
      runtime,
      module_cid: moduleCid,
      entry_point: entryPoint || undefined,
      memory_limit_mb: parseInt(memoryLimit) || 64,
      timeout_ms: parseInt(timeout) || 30000,
      env: Object.keys(env).length > 0 ? env : undefined,
      allowed_hosts: allowedHosts ? allowedHosts.split(',').map(h => h.trim()) : undefined,
    }

    deployMolt.mutate(spec, { onSuccess: () => onClose() })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-zinc-800 flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="text-base font-semibold text-white">Deploy Molt</h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="my-function"
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Runtime</label>
            <div className="flex gap-2">
              {(['wasm', 'js'] as const).map(rt => (
                <button
                  key={rt}
                  onClick={() => setRuntime(rt)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    runtime === rt
                      ? 'bg-zinc-800 border-zinc-600 text-white'
                      : 'bg-black border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {rt === 'wasm' ? 'WASM' : 'JS/TS'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Module CID</label>
            <input
              value={moduleCid}
              onChange={e => setModuleCid(e.target.value)}
              placeholder="QmYwAPJz..."
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Entry Point</label>
            <input
              value={entryPoint}
              onChange={e => setEntryPoint(e.target.value)}
              placeholder={runtime === 'wasm' ? 'handle' : 'index.ts'}
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Memory (MB)</label>
              <input
                type="number"
                value={memoryLimit}
                onChange={e => setMemoryLimit(e.target.value)}
                className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Timeout (ms)</label>
              <input
                type="number"
                value={timeout}
                onChange={e => setTimeout(e.target.value)}
                className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Allowed Hosts</label>
            <input
              value={allowedHosts}
              onChange={e => setAllowedHosts(e.target.value)}
              placeholder="api.example.com, cdn.example.com"
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Environment Variables</label>
            <textarea
              value={envText}
              onChange={e => setEnvText(e.target.value)}
              placeholder={"KEY=value\nANOTHER=value"}
              rows={3}
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDeploy}
            disabled={!name || !moduleCid || deployMolt.isPending}
            className="btn-action flex-1 justify-center disabled:opacity-40"
          >
            {deployMolt.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deploy'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Molts() {
  const { data: molts = [] } = useMolts()
  const stopMolt = useStopMolt()
  const deleteMolt = useDeleteMolt()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showDeploy, setShowDeploy] = useState(false)

  const filtered = molts.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (search && !m.id.includes(search) && !m.spec.name.includes(search)) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Molts"
        subtitle="Serverless functions — WASM and JS/TS"
        action={
          <button onClick={() => setShowDeploy(true)} className="btn-action">
            <Plus className="w-4 h-4" />
            Deploy Molt
          </button>
        }
      />

      {molts.length > 0 && <StatsBar molts={molts} />}

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
            placeholder="Search by name or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
          />
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {statusFilters.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                statusFilter === s ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

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
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Runtime</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Invocations</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link to={`/app/molts/${m.id}`} className="text-sm font-mono text-blue-400 hover:text-blue-300 transition-colors">
                      {m.spec.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      m.spec.runtime === 'wasm' ? 'bg-purple-500/10 text-purple-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {m.spec.runtime === 'wasm' ? 'WASM' : 'JS/TS'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusDot status={m.status} showLabel />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 text-right font-mono">
                    {m.invocation_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 text-right font-mono">
                    {new Date(m.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-0.5">
                      {m.status === 'running' && (
                        <button
                          onClick={() => stopMolt.mutate(m.id)}
                          title="Stop"
                          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(m.status === 'stopped' || m.status === 'failed') && (
                        <button
                          onClick={() => deleteMolt.mutate(m.id)}
                          title="Delete"
                          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && molts.length > 0 && (
            <div className="px-4 py-8 text-center text-sm text-zinc-600">No molts match your filters.</div>
          )}
        </motion.div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-black border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
          >
            <Link to={`/app/molts/${m.id}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-blue-400">{m.spec.name}</span>
                <StatusDot status={m.status} showLabel />
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className={m.spec.runtime === 'wasm' ? 'text-purple-400' : 'text-amber-400'}>
                  {m.spec.runtime === 'wasm' ? 'WASM' : 'JS/TS'}
                </span>
                <span>{m.invocation_count} invocations</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {molts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border border-zinc-800 rounded-xl p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-zinc-600" />
          </div>
          <h3 className="text-white font-medium mb-1">No molts deployed</h3>
          <p className="text-sm text-zinc-500 mb-5 max-w-xs mx-auto">
            Deploy serverless functions in WASM or JS/TS that run on the Moltbunker network.
          </p>
          <button onClick={() => setShowDeploy(true)} className="btn-action inline-flex">
            <Plus className="w-4 h-4" />
            Deploy Molt
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showDeploy && <DeployModal onClose={() => setShowDeploy(false)} />}
      </AnimatePresence>
    </div>
  )
}
