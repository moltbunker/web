import { useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import {
  REPORT_TYPES,
  validateAbuseReport,
  type AbuseReport,
  type ReportType,
} from '@/lib/abuse-report'

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

const inputClass =
  'w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'

/**
 * Self-contained abuse / takedown intake form. POSTs to the Cloudflare Worker
 * endpoint `/api/abuse`, which persists to D1. Client-side validation mirrors
 * the server limits in `@/lib/abuse-report` (the worker re-validates).
 */
const AbuseReportForm = () => {
  const [form, setForm] = useState<AbuseReport>({
    report_type: 'DMCA',
    target_url: '',
    description: '',
    contact_email: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof AbuseReport, string>>>({})
  const [state, setState] = useState<SubmitState>('idle')
  const [serverError, setServerError] = useState('')

  const update = <K extends keyof AbuseReport>(key: K, value: AbuseReport[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')

    const result = validateAbuseReport(form)
    setErrors(result.errors)
    if (!result.ok) return

    setState('submitting')
    try {
      const res = await fetch('/api/abuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: form.report_type,
          target_url: form.target_url.trim(),
          description: form.description.trim(),
          contact_email: form.contact_email.trim(),
        }),
      })

      if (res.status === 429) {
        setState('error')
        setServerError('Too many reports from this network. Please try again later.')
        return
      }
      if (!res.ok) {
        setState('error')
        setServerError('We could not record your report. Please email abuse@moltbunker.com.')
        return
      }

      setState('success')
      setForm({ report_type: 'DMCA', target_url: '', description: '', contact_email: '' })
    } catch {
      setState('error')
      setServerError('Network error. Please email abuse@moltbunker.com instead.')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-emerald-900 bg-emerald-950/40 p-4 not-prose">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        <div>
          <p className="text-sm font-medium text-emerald-200">Report received.</p>
          <p className="mt-1 text-sm text-emerald-300/80">
            We acknowledge reports within 2 business days and act within 5. For urgent matters
            (CSAM, active attacks) email{' '}
            <a className="underline" href="mailto:abuse@moltbunker.com">
              abuse@moltbunker.com
            </a>{' '}
            directly.
          </p>
          <button
            type="button"
            className="mt-3 text-xs text-emerald-400 underline hover:text-emerald-200"
            onClick={() => setState('idle')}
          >
            Submit another report
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 not-prose" noValidate>
      <div>
        <label htmlFor="abuse-type" className="mb-1 block text-sm font-medium text-zinc-300">
          Report type
        </label>
        <select
          id="abuse-type"
          className={inputClass}
          value={form.report_type}
          onChange={(e) => update('report_type', e.target.value as ReportType)}
        >
          {REPORT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {errors.report_type && (
          <p className="mt-1 text-xs text-red-400">{errors.report_type}</p>
        )}
      </div>

      <div>
        <label htmlFor="abuse-url" className="mb-1 block text-sm font-medium text-zinc-300">
          Reported address
        </label>
        <input
          id="abuse-url"
          type="text"
          inputMode="url"
          placeholder="example.moltbunker.dev"
          className={inputClass}
          value={form.target_url}
          onChange={(e) => update('target_url', e.target.value)}
        />
        {errors.target_url && <p className="mt-1 text-xs text-red-400">{errors.target_url}</p>}
      </div>

      <div>
        <label htmlFor="abuse-description" className="mb-1 block text-sm font-medium text-zinc-300">
          Description
        </label>
        <textarea
          id="abuse-description"
          rows={5}
          placeholder="Describe the abusive content or behaviour, and (for DMCA) identify the copyrighted work."
          className={inputClass}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
        {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="abuse-email" className="mb-1 block text-sm font-medium text-zinc-300">
          Contact email <span className="text-zinc-600">(optional)</span>
        </label>
        <input
          id="abuse-email"
          type="email"
          placeholder="you@example.com"
          className={inputClass}
          value={form.contact_email}
          onChange={(e) => update('contact_email', e.target.value)}
        />
        {errors.contact_email && (
          <p className="mt-1 text-xs text-red-400">{errors.contact_email}</p>
        )}
        <p className="mt-1 text-xs text-zinc-600">
          Provide an email if you want a response. DMCA notices require valid contact details.
        </p>
      </div>

      {state === 'error' && serverError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-900 bg-red-950/40 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{serverError}</p>
        </div>
      )}

      <Button type="submit" variant="primary" size="md" disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Submitting…' : 'Submit report'}
      </Button>
    </form>
  )
}

export default AbuseReportForm
