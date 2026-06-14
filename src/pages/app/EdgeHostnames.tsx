import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, Plus, Trash2 } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import StatusDot from '@/components/app/StatusDot'
import CodeBlock from '@/components/ui/CodeBlock'
import { useCustomHostnames, useAddCustomHostname, useDeleteCustomHostname } from '@/hooks/useApi'
import type { CustomHostnameStatus } from '@/lib/api'

// Map ACME hostname status onto the StatusDot palette.
const STATUS_DOT: Record<CustomHostnameStatus, string> = {
  pending: 'pending',
  active: 'running',
  error: 'error',
}

export default function EdgeHostnames() {
  const [searchParams, setSearchParams] = useSearchParams()
  const containerId = searchParams.get('container') ?? ''

  const { data: hostnames = [], isLoading } = useCustomHostnames(containerId)
  const addHostname = useAddCustomHostname()
  const deleteHostname = useDeleteCustomHostname()

  const [fqdn, setFqdn] = useState('')

  const handleAdd = async () => {
    if (!containerId || !fqdn.trim()) return
    try {
      await addHostname.mutateAsync({ container_id: containerId, hostname: fqdn.trim() })
      setFqdn('')
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Custom Hostnames" subtitle="BYO hostname + ACME issuance (EDGE-02)" />

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
          <Globe className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">Enter a container ID to manage its custom hostnames.</p>
        </div>
      ) : (
        <>
          {/* Add hostname */}
          <div className="bg-black border border-zinc-800 rounded-lg p-4">
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Add Hostname</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={fqdn}
                onChange={(e) => setFqdn(e.target.value)}
                placeholder="app.example.com"
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button
                onClick={handleAdd}
                disabled={!fqdn.trim() || addHostname.isPending}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {addHostname.isPending ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {/* Hostname list */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="bg-black border border-zinc-800 rounded-lg px-4 py-12 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
              </div>
            ) : hostnames.length === 0 ? (
              <div className="bg-black border border-zinc-800 rounded-lg px-4 py-12 text-center">
                <p className="text-sm text-zinc-500">No custom hostnames yet.</p>
                <p className="text-xs text-zinc-600 mt-1">Add one above once the edge layer is live.</p>
              </div>
            ) : (
              hostnames.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-black border border-zinc-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <StatusDot status={STATUS_DOT[h.status]} />
                      <span className="text-sm text-white font-mono truncate">{h.hostname}</span>
                      <span className="text-xs text-zinc-500 capitalize shrink-0">{h.status}</span>
                    </div>
                    <button
                      onClick={() => deleteHostname.mutate({ id: h.id, containerId })}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors shrink-0"
                      aria-label="Delete hostname"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {h.status === 'pending' && h.acme_challenge && (
                    <div className="mt-3">
                      <p className="text-xs text-zinc-500 mb-1.5">ACME challenge — add this DNS TXT record:</p>
                      <CodeBlock code={h.acme_challenge} />
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
