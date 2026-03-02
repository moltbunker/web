import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Search, Square, Trash2, X, Loader2, Plus } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import StatusDot from '@/components/app/StatusDot'
import { useAgents, useDeployAgent, useStopAgent, useDeleteAgent } from '@/hooks/useApi'
import type { AgentDeployment, AgentSpec, AgentFramework } from '@/lib/api'

const statusFilters = ['all', 'running', 'stopped', 'failed'] as const

const frameworkColors: Record<AgentFramework, string> = {
  langgraph: 'bg-purple-500/10 text-purple-400',
  crewai: 'bg-blue-500/10 text-blue-400',
  autogen: 'bg-green-500/10 text-green-400',
  custom: 'bg-zinc-500/10 text-zinc-400',
}

function StatsBar({ agents }: { agents: AgentDeployment[] }) {
  const running = agents.filter(a => a.status === 'running').length
  const stopped = agents.filter(a => a.status === 'stopped').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex gap-4 text-sm"
    >
      <span className="text-zinc-400"><span className="text-white font-medium">{agents.length}</span> total</span>
      <span className="text-zinc-400"><span className="text-green-400 font-medium">{running}</span> running</span>
      <span className="text-zinc-400"><span className="text-zinc-500 font-medium">{stopped}</span> stopped</span>
    </motion.div>
  )
}

function DeployModal({ onClose }: { onClose: () => void }) {
  const deployAgent = useDeployAgent()
  const [name, setName] = useState('')
  const [framework, setFramework] = useState<AgentFramework>('langgraph')
  const [image, setImage] = useState('')
  const [model, setModel] = useState('')
  const [temperature, setTemperature] = useState('0.7')
  const [envText, setEnvText] = useState('')
  const [maxTokens, setMaxTokens] = useState('100000')
  const [timeoutSec, setTimeoutSec] = useState('300')
  const [memoryLimit, setMemoryLimit] = useState('512')
  const [cpuCores, setCpuCores] = useState('1')

  const handleDeploy = () => {
    const env: Record<string, string> = {}
    envText.split('\n').filter(Boolean).forEach(line => {
      const [k, ...v] = line.split('=')
      if (k) env[k.trim()] = v.join('=').trim()
    })

    const config: Record<string, string> = {}
    if (model) config.model = model
    if (temperature) config.temperature = temperature

    const spec: AgentSpec = {
      name,
      framework,
      image: image || undefined,
      config: Object.keys(config).length > 0 ? config : undefined,
      env: Object.keys(env).length > 0 ? env : undefined,
      max_tokens: parseInt(maxTokens) || 100000,
      timeout_sec: parseInt(timeoutSec) || 300,
      memory_limit_mb: parseInt(memoryLimit) || 512,
      cpu_cores: parseFloat(cpuCores) || 1,
    }

    deployAgent.mutate(spec, { onSuccess: () => onClose() })
  }

  const frameworks: { id: AgentFramework; label: string; desc: string }[] = [
    { id: 'langgraph', label: 'LangGraph', desc: 'Multi-agent orchestration' },
    { id: 'crewai', label: 'CrewAI', desc: 'Role-based collaboration' },
    { id: 'autogen', label: 'AutoGen', desc: 'Multi-agent conversations' },
    { id: 'custom', label: 'Custom', desc: 'Bring your own runtime' },
  ]

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
          <h3 className="text-base font-semibold text-white">Deploy Agent</h3>
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
              placeholder="my-agent"
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Framework</label>
            <div className="grid grid-cols-2 gap-2">
              {frameworks.map(fw => (
                <button
                  key={fw.id}
                  onClick={() => setFramework(fw.id)}
                  className={`px-3 py-2.5 rounded-lg text-left border transition-colors ${
                    framework === fw.id
                      ? 'bg-zinc-800 border-zinc-600 text-white'
                      : 'bg-black border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className="text-sm font-medium">{fw.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{fw.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Container Image</label>
            <input
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="python:3.12-slim"
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Model</label>
              <input
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="claude-sonnet-4-6"
                className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Temperature</label>
              <input
                type="number"
                value={temperature}
                onChange={e => setTemperature(e.target.value)}
                step="0.1"
                min="0"
                max="2"
                className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Max Tokens</label>
              <input
                type="number"
                value={maxTokens}
                onChange={e => setMaxTokens(e.target.value)}
                className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Timeout (sec)</label>
              <input
                type="number"
                value={timeoutSec}
                onChange={e => setTimeoutSec(e.target.value)}
                className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>
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
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">CPU Cores</label>
              <input
                type="number"
                value={cpuCores}
                onChange={e => setCpuCores(e.target.value)}
                step="0.5"
                min="0.5"
                className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Environment Variables</label>
            <textarea
              value={envText}
              onChange={e => setEnvText(e.target.value)}
              placeholder={"API_KEY=sk-...\nMODEL=claude-sonnet-4-6"}
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
            disabled={!name || deployAgent.isPending}
            className="btn-action flex-1 justify-center disabled:opacity-40"
          >
            {deployAgent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deploy'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Agents() {
  const { data: agents = [] } = useAgents()
  const stopAgent = useStopAgent()
  const deleteAgent = useDeleteAgent()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showDeploy, setShowDeploy] = useState(false)

  const filtered = agents.filter((a: AgentDeployment) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (search && !a.id.includes(search) && !a.spec.name.includes(search)) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agents"
        subtitle="Deploy and manage autonomous AI agents"
        action={
          <button onClick={() => setShowDeploy(true)} className="btn-action">
            <Plus className="w-4 h-4" />
            Deploy Agent
          </button>
        }
      />

      {agents.length > 0 && <StatsBar agents={agents} />}

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
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Framework</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Invocations</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Tokens</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((a: AgentDeployment, i: number) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link to={`/app/agents/${a.id}`} className="text-sm font-mono text-blue-400 hover:text-blue-300 transition-colors">
                      {a.spec.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${frameworkColors[a.spec.framework]}`}>
                      {a.spec.framework}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusDot status={a.status} showLabel />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 text-right font-mono">{a.invocation_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 text-right font-mono">{a.tokens_used.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500 text-right font-mono">
                    {new Date(a.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-0.5">
                      {a.status === 'running' && (
                        <button
                          onClick={() => stopAgent.mutate(a.id)}
                          title="Stop"
                          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(a.status === 'stopped' || a.status === 'failed') && (
                        <button
                          onClick={() => deleteAgent.mutate(a.id)}
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
          {filtered.length === 0 && agents.length > 0 && (
            <div className="px-4 py-8 text-center text-sm text-zinc-600">No agents match your filters.</div>
          )}
        </motion.div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((a: AgentDeployment, i: number) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-black border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
          >
            <Link to={`/app/agents/${a.id}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-blue-400">{a.spec.name}</span>
                <StatusDot status={a.status} showLabel />
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className={frameworkColors[a.spec.framework].split(' ')[1]}>{a.spec.framework}</span>
                <span>{a.invocation_count} invocations</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {agents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border border-zinc-800 rounded-xl p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-5 h-5 text-zinc-600" />
          </div>
          <h3 className="text-white font-medium mb-1">No agents deployed</h3>
          <p className="text-sm text-zinc-500 mb-5 max-w-xs mx-auto">
            Deploy autonomous AI agents with LangGraph, CrewAI, AutoGen, or custom frameworks on the Moltbunker network.
          </p>
          <button onClick={() => setShowDeploy(true)} className="btn-action inline-flex">
            <Plus className="w-4 h-4" />
            Deploy Agent
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showDeploy && <DeployModal onClose={() => setShowDeploy(false)} />}
      </AnimatePresence>
    </div>
  )
}
