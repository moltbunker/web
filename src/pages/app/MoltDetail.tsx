import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Square, Trash2, Copy, Check, Send, Loader2 } from 'lucide-react'
import StatusDot from '@/components/app/StatusDot'
import TerminalLog from '@/components/app/TerminalLog'
import { useMolt, useMoltMetrics, useMoltLogs, useStopMolt, useDeleteMolt, useInvokeMolt } from '@/hooks/useApi'
import type { MoltInvokeResponse } from '@/lib/api'

const tabs = ['Overview', 'Metrics', 'Logs', 'Test'] as const
type Tab = (typeof tabs)[number]

export default function MoltDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [copiedId, setCopiedId] = useState(false)

  const { data: molt, isLoading } = useMolt(id ?? '')
  const { data: metrics } = useMoltMetrics(id ?? '')
  const { data: logs = [] } = useMoltLogs(id ?? '')
  const stopMolt = useStopMolt()
  const deleteMolt = useDeleteMolt()

  if (isLoading || !molt) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
      </div>
    )
  }

  const copyId = () => {
    navigator.clipboard.writeText(id ?? '')
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app/molts" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{molt.spec.name}</h1>
            <button onClick={copyId} className="p-1 text-zinc-500 hover:text-white transition-colors">
              {copiedId ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <StatusDot status={molt.status} showLabel />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
          {molt.status === 'running' && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => id && stopMolt.mutate(id)}
              disabled={stopMolt.isPending}
              className="btn-action"
            >
              <Square className="w-4 h-4" />
              {stopMolt.isPending ? 'Stopping...' : 'Stop'}
            </motion.button>
          )}
          {(molt.status === 'stopped' || molt.status === 'failed') && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => id && deleteMolt.mutate(id)}
              disabled={deleteMolt.isPending}
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

      <div className="border-b border-zinc-800">
        <nav className="flex gap-4">
          {tabs.map(tab => (
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
                  layoutId="moltTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

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
              ['Name', molt.spec.name],
              ['Runtime', molt.spec.runtime === 'wasm' ? 'WASM (wazero)' : 'JS/TS (Deno)'],
              ['Module CID', molt.spec.module_cid],
              ['Entry Point', molt.spec.entry_point ?? 'default'],
              ['Memory Limit', `${molt.spec.memory_limit_mb ?? 64} MB`],
              ['Timeout', `${molt.spec.timeout_ms ?? 30000} ms`],
              ['Invocations', molt.invocation_count.toLocaleString()],
              ['Created', new Date(molt.created_at).toLocaleString()],
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

        {activeTab === 'Metrics' && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {[
              ['Invocations', metrics?.invocations?.toLocaleString() ?? '—'],
              ['Success Rate', metrics ? `${((1 - (metrics.errors / Math.max(metrics.invocations, 1))) * 100).toFixed(1)}%` : '—'],
              ['Errors', metrics?.errors?.toLocaleString() ?? '—'],
              ['Avg Latency', metrics ? `${metrics.avg_duration_ms.toFixed(0)} ms` : '—'],
            ].map(([label, value], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-black border border-zinc-800 rounded-lg px-4 py-4 text-center hover:border-zinc-700 transition-colors"
              >
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
                <p className="text-xl text-white mt-1 font-mono">{value}</p>
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
            <TerminalLog title={`${molt.spec.name} logs`} lines={logs} maxHeight="500px" />
          </motion.div>
        )}

        {activeTab === 'Test' && (
          <motion.div
            key="test"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <InvokePanel moltId={id ?? ''} isRunning={molt.status === 'running'} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InvokePanel({ moltId, isRunning }: { moltId: string; isRunning: boolean }) {
  const invoke = useInvokeMolt()
  const [method, setMethod] = useState('GET')
  const [path, setPath] = useState('/')
  const [body, setBody] = useState('')
  const [response, setResponse] = useState<MoltInvokeResponse | null>(null)

  const handleInvoke = () => {
    invoke.mutate(
      { id: moltId, req: { method, path, body: body || undefined } },
      { onSuccess: (res) => setResponse(res) },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          className="px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
        >
          {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          value={path}
          onChange={e => setPath(e.target.value)}
          placeholder="/"
          className="flex-1 px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
        />
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleInvoke}
          disabled={!isRunning || invoke.isPending}
          className="btn-action disabled:opacity-40"
        >
          {invoke.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Invoke
        </motion.button>
      </div>

      {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder='{"key": "value"}'
          rows={4}
          className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono resize-none"
        />
      )}

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border border-zinc-800 rounded-lg overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
            <span className={`text-sm font-mono font-medium ${
              response.status_code < 400 ? 'text-green-400' : 'text-red-400'
            }`}>
              {response.status_code}
            </span>
            <span className="text-xs text-zinc-500">{response.duration_ms}ms</span>
          </div>
          <pre className="p-4 text-sm text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap">
            {response.error || response.body || '(empty response)'}
          </pre>
        </motion.div>
      )}
    </div>
  )
}
