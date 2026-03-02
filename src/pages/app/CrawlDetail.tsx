import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import StatusDot from '@/components/app/StatusDot'
import { useCrawlJob, useCrawlResults } from '@/hooks/useApi'
import type { CrawlResult } from '@/lib/api'

const tabs = ['Overview', 'Results', 'Config'] as const
type Tab = (typeof tabs)[number]

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function ProgressBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0
  return (
    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5 }}
        className="h-full bg-red-500 rounded-full"
      />
    </div>
  )
}

function ResultRow({ result }: { result: CrawlResult }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-zinc-800/50 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-900/50 transition-colors text-left"
      >
        <span className={`text-xs font-mono font-medium ${
          result.status_code < 400 ? 'text-green-400' : 'text-red-400'
        }`}>
          {result.status_code}
        </span>
        <span className="flex-1 text-sm text-zinc-300 font-mono truncate">{result.url}</span>
        <span className="text-xs text-zinc-500 shrink-0">{result.duration_ms}ms</span>
        <span className="text-xs text-zinc-500 shrink-0">{formatBytes(result.byte_size)}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {result.title && (
                <div>
                  <span className="text-xs text-zinc-500">Title: </span>
                  <span className="text-sm text-white">{result.title}</span>
                </div>
              )}
              {result.content_type && (
                <div>
                  <span className="text-xs text-zinc-500">Content-Type: </span>
                  <span className="text-sm text-zinc-400 font-mono">{result.content_type}</span>
                </div>
              )}
              {result.text && (
                <pre className="bg-zinc-900/50 rounded-lg p-3 text-xs text-zinc-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {result.text.slice(0, 2000)}{result.text.length > 2000 ? '...' : ''}
                </pre>
              )}
              {result.error && (
                <p className="text-sm text-red-400">{result.error}</p>
              )}
              {result.selectors && Object.keys(result.selectors).length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500">Extracted:</span>
                  {Object.entries(result.selectors).map(([sel, val]) => (
                    <div key={sel} className="flex gap-2 text-xs">
                      <span className="text-purple-400 font-mono">{sel}:</span>
                      <span className="text-zinc-400">{val}</span>
                    </div>
                  ))}
                </div>
              )}
              {result.links && result.links.length > 0 && (
                <div>
                  <span className="text-xs text-zinc-500">{result.links.length} links found</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CrawlDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [copiedId, setCopiedId] = useState(false)

  const { data: job, isLoading } = useCrawlJob(id ?? '')
  const { data: results = [] } = useCrawlResults(id ?? '')

  if (isLoading || !job) {
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
        <Link to="/app/crawl" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-mono">{id?.slice(0, 12)}...</h1>
            <button onClick={copyId} className="p-1 text-zinc-500 hover:text-white transition-colors">
              {copiedId ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <StatusDot status={job.status} showLabel />
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
                  layoutId="crawlTab"
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
                ['Status', job.status],
                ['Pages Crawled', `${job.pages_crawled}${job.config.max_pages ? ` / ${job.config.max_pages}` : ''}`],
                ['Total Size', formatBytes(job.total_bytes)],
                ['URLs', job.config.urls.join(', ')],
                ['Created', new Date(job.created_at).toLocaleString()],
                ['Started', job.started_at ? new Date(job.started_at).toLocaleString() : '—'],
                ['Completed', job.completed_at ? new Date(job.completed_at).toLocaleString() : '—'],
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

            {job.config.max_pages && job.status === 'running' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Progress</span>
                  <span>{job.pages_crawled} / {job.config.max_pages}</span>
                </div>
                <ProgressBar current={job.pages_crawled} max={job.config.max_pages} />
              </div>
            )}

            {job.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-sm text-red-400">{job.error}</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'Results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-black border border-zinc-800 rounded-lg overflow-hidden">
              {results.length > 0 ? (
                results.map((r: CrawlResult, i: number) => (
                  <motion.div
                    key={`${r.url}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <ResultRow result={r} />
                  </motion.div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-zinc-600">
                  {job.status === 'running' ? 'Crawling in progress...' : 'No results available.'}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'Config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-black border border-zinc-800 rounded-lg p-4">
              <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap">
                {JSON.stringify(job.config, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
