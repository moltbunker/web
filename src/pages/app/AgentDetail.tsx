import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Square, Trash2, Copy, Check, Send, Loader2, Plus, X } from 'lucide-react'
import StatusDot from '@/components/app/StatusDot'
import { useAgent, useAgentMemory, useStopAgent, useDeleteAgent, useInvokeAgent, useSetAgentMemory, useDeleteAgentMemory } from '@/hooks/useApi'
import type { AgentInvokeResponse, AgentFramework, MemoryEntry } from '@/lib/api'

const frameworkColors: Record<AgentFramework, string> = {
  langgraph: 'bg-purple-500/10 text-purple-400',
  crewai: 'bg-blue-500/10 text-blue-400',
  autogen: 'bg-green-500/10 text-green-400',
  custom: 'bg-zinc-500/10 text-zinc-400',
}

const tabs = ['Overview', 'Chat', 'Memory'] as const
type Tab = (typeof tabs)[number]

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  tokens?: number
  duration_ms?: number
}

export default function AgentDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [copiedId, setCopiedId] = useState(false)

  const { data: agent, isLoading } = useAgent(id ?? '')
  const stopAgent = useStopAgent()
  const deleteAgent = useDeleteAgent()

  if (isLoading || !agent) {
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
        <Link to="/app/agents" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{agent.spec.name}</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${frameworkColors[agent.spec.framework]}`}>
              {agent.spec.framework}
            </span>
            <button onClick={copyId} className="p-1 text-zinc-500 hover:text-white transition-colors">
              {copiedId ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <StatusDot status={agent.status} showLabel />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
          {agent.status === 'running' && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => id && stopAgent.mutate(id)}
              disabled={stopAgent.isPending}
              className="btn-action"
            >
              <Square className="w-4 h-4" />
              {stopAgent.isPending ? 'Stopping...' : 'Stop'}
            </motion.button>
          )}
          {(agent.status === 'stopped' || agent.status === 'failed') && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => id && deleteAgent.mutate(id)}
              disabled={deleteAgent.isPending}
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
                  layoutId="agentTab"
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
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['Name', agent.spec.name],
                ['Framework', agent.spec.framework],
                ['Image', agent.spec.image ?? '—'],
                ['Status', agent.status],
                ['Invocations', agent.invocation_count.toLocaleString()],
                ['Tokens Used', agent.tokens_used.toLocaleString()],
                ['Max Tokens', agent.spec.max_tokens?.toLocaleString() ?? '—'],
                ['Timeout', agent.spec.timeout_sec ? `${agent.spec.timeout_sec}s` : '—'],
                ['Memory Limit', agent.spec.memory_limit_mb ? `${agent.spec.memory_limit_mb} MB` : '—'],
                ['CPU Cores', agent.spec.cpu_cores?.toString() ?? '—'],
                ['Created', new Date(agent.created_at).toLocaleString()],
                ['Node', agent.node_id ?? '—'],
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
            </div>

            {agent.spec.config && Object.keys(agent.spec.config).length > 0 && (
              <div className="bg-black border border-zinc-800 rounded-lg px-4 py-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Config</p>
                <div className="space-y-1">
                  {Object.entries(agent.spec.config).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-sm">
                      <span className="text-zinc-500 font-mono">{k}:</span>
                      <span className="text-white font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'Chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ChatPanel agentId={id ?? ''} isRunning={agent.status === 'running'} />
          </motion.div>
        )}

        {activeTab === 'Memory' && (
          <motion.div
            key="memory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <MemoryPanel agentId={id ?? ''} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChatPanel({ agentId, isRunning }: { agentId: string; isRunning: boolean }) {
  const invoke = useInvokeAgent()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    invoke.mutate(
      { id: agentId, req: { message: input } },
      {
        onSuccess: (res: AgentInvokeResponse) => {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: res.error || res.response,
              tokens: res.tokens_used,
              duration_ms: res.duration_ms,
            },
          ])
        },
        onError: () => {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: 'Error: Failed to get response.' },
          ])
        },
      },
    )
  }

  return (
    <div className="bg-black border border-zinc-800 rounded-lg flex flex-col" style={{ height: '500px' }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            Send a message to start the conversation.
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
              msg.role === 'user'
                ? 'bg-red-500/10 border border-red-500/20 text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.tokens !== undefined && (
                <p className="text-xs text-zinc-600 mt-1">
                  {msg.tokens.toLocaleString()} tokens · {msg.duration_ms}ms
                </p>
              )}
            </div>
          </motion.div>
        ))}
        {invoke.isPending && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-zinc-800 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={isRunning ? 'Type a message...' : 'Agent is not running'}
          disabled={!isRunning}
          className="flex-1 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 disabled:opacity-40"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!isRunning || !input.trim() || invoke.isPending}
          className="btn-action disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
}

function MemoryPanel({ agentId }: { agentId: string }) {
  const { data: memory = [] } = useAgentMemory(agentId)
  const setMemory = useSetAgentMemory()
  const deleteMemory = useDeleteAgentMemory()
  const [showAdd, setShowAdd] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const handleAdd = () => {
    if (!newKey.trim()) return
    setMemory.mutate(
      { id: agentId, entry: { key: newKey, value: newValue } },
      { onSuccess: () => { setShowAdd(false); setNewKey(''); setNewValue('') } },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(true)} className="btn-action text-sm">
          <Plus className="w-3.5 h-3.5" />
          Add Entry
        </button>
      </div>

      <div className="bg-black border border-zinc-800 rounded-lg overflow-hidden">
        {memory.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Key</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Updated</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {memory.map((entry: MemoryEntry, i: number) => (
                <motion.tr
                  key={entry.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-white">{entry.key}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 font-mono truncate max-w-[300px]">{entry.value}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500 text-right font-mono">
                    {new Date(entry.updated_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteMemory.mutate({ id: agentId, key: entry.key })}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-zinc-600">No memory entries.</div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4"
            >
              <h3 className="text-lg font-bold text-white mb-4">Add Memory Entry</h3>
              <div className="space-y-3">
                <input
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  placeholder="Key"
                  className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
                />
                <textarea
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder="Value"
                  rows={3}
                  className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono resize-none"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  disabled={!newKey.trim() || setMemory.isPending}
                  className="btn-action flex-1 justify-center disabled:opacity-40"
                >
                  {setMemory.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
