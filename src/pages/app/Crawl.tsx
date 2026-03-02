import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanSearch, Search, X, Loader2, Plus, XCircle } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import StatusDot from '@/components/app/StatusDot'
import { useCrawlJobs, useCrawlStats, useCreateCrawlJob, useCancelCrawlJob } from '@/hooks/useApi'
import type { CrawlJob, CrawlConfig } from '@/lib/api'

const statusFilters = ['all', 'running', 'completed', 'failed', 'cancelled'] as const

function StatsBar({ stats }: { stats: { total_jobs: number; running_jobs: number; completed_jobs: number; failed_jobs: number; total_pages: number } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex gap-4 text-sm flex-wrap"
    >
      <span className="text-zinc-400"><span className="text-white font-medium">{stats.total_jobs}</span> jobs</span>
      <span className="text-zinc-400"><span className="text-green-400 font-medium">{stats.running_jobs}</span> running</span>
      <span className="text-zinc-400"><span className="text-blue-400 font-medium">{stats.completed_jobs}</span> completed</span>
      {stats.failed_jobs > 0 && (
        <span className="text-zinc-400"><span className="text-red-400 font-medium">{stats.failed_jobs}</span> failed</span>
      )}
      <span className="text-zinc-400"><span className="text-white font-medium">{stats.total_pages.toLocaleString()}</span> pages crawled</span>
    </motion.div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function CreateJobModal({ onClose }: { onClose: () => void }) {
  const createJob = useCreateCrawlJob()
  const [urls, setUrls] = useState('')
  const [maxDepth, setMaxDepth] = useState('2')
  const [maxPages, setMaxPages] = useState('100')
  const [domains, setDomains] = useState('')
  const [selectors, setSelectors] = useState('')
  const [javascript, setJavascript] = useState(false)
  const [screenshot, setScreenshot] = useState(false)
  const [useTor, setUseTor] = useState(false)
  const [respectRobots, setRespectRobots] = useState(true)
  const [timeout, setTimeout] = useState('30')

  const handleCreate = () => {
    const config: CrawlConfig = {
      urls: urls.split('\n').map(u => u.trim()).filter(Boolean),
      max_depth: parseInt(maxDepth) || 2,
      max_pages: parseInt(maxPages) || 100,
      allowed_domains: domains ? domains.split(',').map(d => d.trim()) : undefined,
      selectors: selectors ? selectors.split(',').map(s => s.trim()) : undefined,
      screenshot,
      javascript,
      timeout_sec: parseInt(timeout) || 30,
      respect_robots: respectRobots,
      use_tor: useTor,
    }
    createJob.mutate(config, { onSuccess: () => onClose() })
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
          <h3 className="text-base font-semibold text-white">New Crawl Job</h3>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">URLs (one per line)</label>
            <textarea
              value={urls}
              onChange={e => setUrls(e.target.value)}
              placeholder={"https://example.com\nhttps://docs.example.com"}
              rows={3}
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Max Depth</label>
              <input
                type="number"
                value={maxDepth}
                onChange={e => setMaxDepth(e.target.value)}
                min="0"
                max="10"
                className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Max Pages</label>
              <input
                type="number"
                value={maxPages}
                onChange={e => setMaxPages(e.target.value)}
                min="1"
                max="10000"
                className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Allowed Domains</label>
            <input
              value={domains}
              onChange={e => setDomains(e.target.value)}
              placeholder="example.com, docs.example.com"
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">CSS Selectors</label>
            <input
              value={selectors}
              onChange={e => setSelectors(e.target.value)}
              placeholder="h1, .main-content, article"
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Timeout (sec)</label>
            <input
              type="number"
              value={timeout}
              onChange={e => setTimeout(e.target.value)}
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { label: 'JavaScript', checked: javascript, set: setJavascript },
              { label: 'Screenshots', checked: screenshot, set: setScreenshot },
              { label: 'Use Tor', checked: useTor, set: setUseTor },
              { label: 'Robots.txt', checked: respectRobots, set: setRespectRobots },
            ].map(opt => (
              <label key={opt.label} className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={e => opt.set(e.target.checked)}
                  className="rounded border-zinc-700 bg-black text-red-500 focus:ring-red-500/20"
                />
                {opt.label}
              </label>
            ))}
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
            onClick={handleCreate}
            disabled={!urls.trim() || createJob.isPending}
            className="btn-action flex-1 justify-center disabled:opacity-40"
          >
            {createJob.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Crawl'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Crawl() {
  const { data: jobs = [] } = useCrawlJobs()
  const { data: stats } = useCrawlStats()
  const cancelJob = useCancelCrawlJob()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = jobs.filter((j: CrawlJob) => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false
    if (search && !j.id.includes(search) && !j.config.urls.some(u => u.includes(search))) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Web Crawling"
        subtitle="Distributed web crawling with Tor support"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-action">
            <Plus className="w-4 h-4" />
            New Crawl Job
          </button>
        }
      />

      {stats && stats.total_jobs > 0 && <StatsBar stats={stats} />}

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
            placeholder="Search by ID or URL..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">URLs</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Pages</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Size</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((j: CrawlJob, i: number) => (
                <motion.tr
                  key={j.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link to={`/app/crawl/${j.id}`} className="text-sm font-mono text-blue-400 hover:text-blue-300 transition-colors">
                      {j.id.slice(0, 12)}...
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300 font-mono truncate max-w-[200px]">
                    {j.config.urls[0]}{j.config.urls.length > 1 && ` +${j.config.urls.length - 1}`}
                  </td>
                  <td className="px-4 py-3">
                    <StatusDot status={j.status} showLabel />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 text-right font-mono">{j.pages_crawled}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 text-right font-mono">{formatBytes(j.total_bytes)}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500 text-right font-mono">
                    {new Date(j.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(j.status === 'pending' || j.status === 'running') && (
                      <button
                        onClick={() => cancelJob.mutate(j.id)}
                        title="Cancel"
                        className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && jobs.length > 0 && (
            <div className="px-4 py-8 text-center text-sm text-zinc-600">No crawl jobs match your filters.</div>
          )}
        </motion.div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((j: CrawlJob, i: number) => (
          <motion.div
            key={j.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-black border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
          >
            <Link to={`/app/crawl/${j.id}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-blue-400">{j.id.slice(0, 12)}...</span>
                <StatusDot status={j.status} showLabel />
              </div>
              <p className="text-xs text-zinc-400 font-mono truncate">{j.config.urls[0]}</p>
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                <span>{j.pages_crawled} pages</span>
                <span>{formatBytes(j.total_bytes)}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {jobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border border-zinc-800 rounded-xl p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
            <ScanSearch className="w-5 h-5 text-zinc-600" />
          </div>
          <h3 className="text-white font-medium mb-1">No crawl jobs</h3>
          <p className="text-sm text-zinc-500 mb-5 max-w-xs mx-auto">
            Start crawling the web with distributed workers, Tor routing, and structured data extraction.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-action inline-flex">
            <Plus className="w-4 h-4" />
            New Crawl Job
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showCreate && <CreateJobModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  )
}
