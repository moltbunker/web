import { useState } from 'react'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, Copy, Trash2, Plus, Check, AlertTriangle, Globe, Shield, Bot } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import TerminalLog from '@/components/app/TerminalLog'
import StatusDot from '@/components/app/StatusDot'
import { useApiKeys, useCreateApiKey, useDeleteApiKey, useStatus } from '@/hooks/useApi'
import type { ApiKeyListItem } from '@/lib/api'

// Mock fallback
const mockApiKeys: ApiKeyListItem[] = [
  { id: '1', prefix: 'mb_live_a3kf', name: 'Production', created_at: '2026-01-15T00:00:00Z', last_used_at: '2026-02-10T12:00:00Z' },
  { id: '2', prefix: 'mb_live_x9zm', name: 'CI/CD Pipeline', created_at: '2026-02-01T00:00:00Z', last_used_at: '2026-02-10T11:00:00Z' },
]

export default function Settings() {
  const { address } = useAccount()
  const { data: apiKeys } = useApiKeys()
  const { data: status } = useStatus()
  const createKey = useCreateApiKey()
  const deleteKey = useDeleteApiKey()

  const keys = apiKeys ?? mockApiKeys

  const [copied, setCopied] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  // Preferences (localStorage)
  const [defaultRegion, setDefaultRegion] = useState(() => localStorage.getItem('mb_pref_region') ?? 'auto')
  const [defaultTier, setDefaultTier] = useState(() => localStorage.getItem('mb_pref_tier') ?? 'standard')
  const [autoClone, setAutoClone] = useState(() => localStorage.getItem('mb_pref_autoclone') === 'true')

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return
    try {
      const result = await createKey.mutateAsync({ name: newKeyName })
      setCreatedKey(result.key)
      setNewKeyName('')
    } catch {
      // Error handled by mutation
    }
  }

  const copyNewKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  const savePreference = (key: string, value: string) => {
    localStorage.setItem(key, value)
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader title="Settings" subtitle="Wallet, API keys, node config, and preferences" />

      {/* Wallet */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg font-semibold text-white mb-4">Wallet</h2>
        <div className="bg-black border border-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Connected Address</p>
          <div className="flex items-center gap-2">
            <code className="text-sm text-white font-mono flex-1 truncate">{address}</code>
            <button onClick={copyAddress} className="p-2 text-zinc-400 hover:text-white transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* API Keys */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">API Keys</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowCreateModal(true); setCreatedKey(null) }}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Key
          </motion.button>
        </div>
        <div className="bg-black border border-zinc-800 rounded-lg divide-y divide-zinc-800/50 overflow-hidden">
          {keys.map((key, i) => (
            <motion.div
              key={key.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-zinc-500" />
                <div>
                  <p className="text-sm text-white">{key.name}</p>
                  <p className="text-xs text-zinc-500 font-mono">{key.prefix}... &middot; {new Date(key.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {key.last_used_at && (
                  <span className="text-xs text-zinc-500 hidden sm:block">
                    Last used {new Date(key.last_used_at).toLocaleDateString()}
                  </span>
                )}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteKey.mutate(key.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
          {keys.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-zinc-600">No API keys yet.</div>
          )}
        </div>
      </motion.div>

      {/* Agent Quick Start */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Agent Quick Start</h2>
        </div>
        <TerminalLog
          title="python — moltbunker SDK"
          lines={[
            { message: '# pip install moltbunker' },
            { message: '' },
            { message: 'from moltbunker import MoltBunkerClient' },
            { message: '' },
            { message: 'client = MoltBunkerClient(' },
            { message: '    api_key="mb_live_...",  # your API key' },
            { message: '    base_url="https://api.moltbunker.com"' },
            { message: ')' },
            { message: '' },
            { message: '# Deploy a container' },
            { message: 'deployment = client.deploy(' },
            { message: '    image="ollama/ollama:latest",' },
            { message: '    tier="performance",' },
            { message: '    region="europe",' },
            { message: '    duration_hours=24' },
            { message: ')' },
            { message: '' },
            { message: 'print(f"Container {deployment.container_id} deployed")' },
            { message: 'print(f"Regions: {deployment.regions}")' },
          ].map(l => ({ ...l, level: undefined, timestamp: undefined }))}
          maxHeight="320px"
        />
      </motion.div>

      {/* Node Config */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-lg font-semibold text-white mb-4">Node Configuration</h2>
        <div className="bg-black border border-zinc-800 rounded-lg divide-y divide-zinc-800/50">
          {[
            { icon: Globe, label: 'Region', value: status?.region ?? 'europe' },
            { icon: Shield, label: 'Node ID', value: status?.node_id?.slice(0, 16) ?? '—', mono: true },
            { label: 'Tor', value: status?.tor_enabled ? 'Active' : 'Disabled', dot: status?.tor_enabled ? 'running' : 'stopped' },
            { label: 'Version', value: status?.version ?? '1.0.0' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-zinc-400">{item.label}</span>
              <div className="flex items-center gap-2">
                {item.dot && <StatusDot status={item.dot} />}
                <span className={`text-sm text-white ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Default Preferences */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-lg font-semibold text-white mb-4">Default Preferences</h2>
        <div className="bg-black border border-zinc-800 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Default Region</label>
            <select
              value={defaultRegion}
              onChange={e => { setDefaultRegion(e.target.value); savePreference('mb_pref_region', e.target.value) }}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-600"
            >
              <option value="auto">Auto (nearest)</option>
              <option value="americas">Americas</option>
              <option value="europe">Europe</option>
              <option value="asia_pacific">Asia Pacific</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Default Tier</label>
            <select
              value={defaultTier}
              onChange={e => { setDefaultTier(e.target.value); savePreference('mb_pref_tier', e.target.value) }}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-600"
            >
              <option value="minimal">Minimal</option>
              <option value="standard">Standard</option>
              <option value="performance">Performance</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoClone}
              onChange={e => { setAutoClone(e.target.checked); savePreference('mb_pref_autoclone', String(e.target.checked)) }}
              className="w-4 h-4 rounded border-zinc-700 text-red-500 focus:ring-red-500 bg-zinc-900"
            />
            <span className="text-sm text-zinc-300">Auto-clone on threat detection</span>
          </label>
        </div>
      </motion.div>

      {/* Create Key Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowCreateModal(false); setCreatedKey(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md mx-4 w-full"
            >
              {createdKey ? (
                <>
                  <h3 className="text-lg font-bold text-white mb-2">API Key Created</h3>
                  <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3 mb-4">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-400">
                      Copy this key now. You won't be able to see it again.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-black border border-zinc-700 rounded-lg px-3 py-2.5 mb-4">
                    <code className="text-sm text-white font-mono flex-1 truncate">{createdKey}</code>
                    <button onClick={copyNewKey} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
                      {copiedKey ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => { setShowCreateModal(false); setCreatedKey(null) }}
                    className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-white mb-4">Create API Key</h3>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    placeholder="Key name (e.g. Production)"
                    className="w-full px-3 py-2.5 bg-black border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 mb-4"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleCreateKey()}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2.5 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateKey}
                      disabled={!newKeyName.trim() || createKey.isPending}
                      className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Create
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
