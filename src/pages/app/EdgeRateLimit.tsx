import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gauge, Check } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import { useRateLimitConfig, useSetRateLimitConfig } from '@/hooks/useApi'
import type { RateLimitBy } from '@/lib/api'

const BY_OPTIONS: RateLimitBy[] = ['ip', 'header']

interface FormState {
  rpm: number
  burst: number
  by: RateLimitBy
}

export default function EdgeRateLimit() {
  const [searchParams, setSearchParams] = useSearchParams()
  const containerId = searchParams.get('container') ?? ''

  const { data: config, isLoading } = useRateLimitConfig(containerId)
  const setConfig = useSetRateLimitConfig()

  // Local edits override the server config; until the user touches anything we
  // render straight from query data (avoids setState-in-effect cascades). The
  // draft is scoped to the container it was made for, so switching the Container
  // ID discards the stale edit and re-derives from that container's server
  // config instead of leaking the previous container's values into a PUT.
  const [draft, setDraft] = useState<{ id: string; form: FormState } | null>(null)
  const [saved, setSaved] = useState(false)

  const activeDraft = draft?.id === containerId ? draft.form : null

  const form: FormState = activeDraft ?? {
    rpm: config?.requests_per_minute ?? 60,
    burst: config?.burst ?? 10,
    by: config?.by ?? 'ip',
  }

  const update = (patch: Partial<FormState>) =>
    setDraft({ id: containerId, form: { ...form, ...patch } })

  const handleSave = async () => {
    if (!containerId) return
    try {
      await setConfig.mutateAsync({
        container_id: containerId,
        requests_per_minute: form.rpm,
        burst: form.burst,
        by: form.by,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Rate Limit" subtitle="Per-container ingress rate limiting (EDGE-01)" />

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
          <Gauge className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">Enter a container ID to configure its rate limit.</p>
        </div>
      ) : isLoading ? (
        <div className="bg-black border border-zinc-800 rounded-lg px-4 py-12 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border border-zinc-800 rounded-lg p-4 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rate-limit-rpm" className="block text-sm text-zinc-400 mb-1.5">Requests per minute</label>
              <input
                id="rate-limit-rpm"
                type="number"
                min={0}
                value={form.rpm}
                onChange={(e) => update({ rpm: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label htmlFor="rate-limit-burst" className="block text-sm text-zinc-400 mb-1.5">Burst</label>
              <input
                id="rate-limit-burst"
                type="number"
                min={0}
                value={form.burst}
                onChange={(e) => update({ burst: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Limit by</label>
            <div className="flex gap-4">
              {BY_OPTIONS.map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rate-limit-by"
                    value={opt}
                    checked={form.by === opt}
                    onChange={() => update({ by: opt })}
                    className="w-4 h-4 text-red-500 focus:ring-red-500 bg-zinc-900 border-zinc-700"
                  />
                  <span className="text-sm text-zinc-300 uppercase">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs text-green-400">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={setConfig.isPending}
              className="btn-action justify-center disabled:cursor-not-allowed"
            >
              {setConfig.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
