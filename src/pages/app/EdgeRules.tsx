import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Plus, Trash2 } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import { useEdgeRules, useCreateEdgeRule, useDeleteEdgeRule } from '@/hooks/useApi'
import type { EdgeRuleType } from '@/lib/api'

const RULE_TYPES: EdgeRuleType[] = ['block', 'allow', 'rate_limit']

export default function EdgeRules() {
  const [searchParams, setSearchParams] = useSearchParams()
  const containerId = searchParams.get('container') ?? ''

  const { data: rules = [], isLoading } = useEdgeRules(containerId)
  const createRule = useCreateEdgeRule()
  const deleteRule = useDeleteEdgeRule()

  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<EdgeRuleType>('block')
  const [pattern, setPattern] = useState('')
  const [action, setAction] = useState('deny')
  const [priority, setPriority] = useState(100)

  const handleCreate = async () => {
    if (!containerId || !pattern.trim()) return
    try {
      await createRule.mutateAsync({
        container_id: containerId,
        type,
        pattern: pattern.trim(),
        action: action.trim() || 'deny',
        priority,
        enabled: true,
      })
      setPattern('')
      setShowForm(false)
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edge Rules" subtitle="L7 WAF rules for this container (EDGE-01)" />

      {/* Container selector */}
      <div className="bg-black border border-zinc-800 rounded-lg p-4">
        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Container ID</label>
        <input
          type="text"
          value={containerId}
          onChange={(e) => setSearchParams(e.target.value ? { container: e.target.value } : {})}
          placeholder="container-id"
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
        />
      </div>

      {!containerId ? (
        <div className="bg-black border border-zinc-800 rounded-lg px-4 py-12 text-center">
          <ShieldCheck className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">Enter a container ID to manage its WAF rules.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Rules</h2>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add rule
            </button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-black border border-zinc-800 rounded-lg p-4 space-y-3 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EdgeRuleType)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-600"
                  >
                    {RULE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Action</label>
                  <input
                    type="text"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="deny"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Priority</label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Pattern</label>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder='e.g. path:/admin or ip:1.2.3.4'
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleCreate}
                  disabled={!pattern.trim() || createRule.isPending}
                  className="btn-action justify-center disabled:cursor-not-allowed"
                >
                  {createRule.isPending ? 'Saving...' : 'Save rule'}
                </button>
              </div>
            </motion.div>
          )}

          <div className="bg-black border border-zinc-800 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="px-4 py-12 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
              </div>
            ) : rules.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-zinc-500">No edge rules configured.</p>
                <p className="text-xs text-zinc-600 mt-1">Add a rule above once the edge layer is live.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">Pattern</th>
                    <th className="px-4 py-2.5 font-medium">Action</th>
                    <th className="px-4 py-2.5 font-medium">Enabled</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-300">{rule.type}</td>
                      <td className="px-4 py-2.5 text-white font-mono truncate max-w-xs">{rule.pattern}</td>
                      <td className="px-4 py-2.5 text-zinc-300">{rule.action}</td>
                      <td className="px-4 py-2.5 text-zinc-300">{rule.enabled ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => deleteRule.mutate({ id: rule.id, containerId })}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                          aria-label="Delete rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
