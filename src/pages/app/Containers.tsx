import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Rocket } from 'lucide-react'
import PageHeader from '@/components/app/PageHeader'
import StatusDot from '@/components/app/StatusDot'
import { useContainers } from '@/hooks/useApi'
import type { ContainerInfo } from '@/lib/api'

// Mock fallback
const mockContainers: ContainerInfo[] = [
  { id: 'mb-a1b2c3d4', image: 'nginx:1.25-alpine', status: 'running', created_at: '2026-02-06T08:00:00Z', encrypted: true, regions: ['americas', 'europe', 'asia_pacific'] },
  { id: 'mb-d4e5f6g7', image: 'redis:7-alpine', status: 'running', created_at: '2026-02-08T14:00:00Z', encrypted: true, regions: ['europe', 'americas'] },
  { id: 'mb-g7h8i9j0', image: 'ollama/ollama:latest', status: 'running', created_at: '2026-02-10T06:00:00Z', encrypted: true, regions: ['americas'] },
  { id: 'mb-j0k1l2m3', image: 'postgres:16', status: 'stopped', created_at: '2026-02-04T10:00:00Z', encrypted: true, regions: ['europe'] },
  { id: 'mb-m3n4o5p6', image: 'python:3.12-slim', status: 'deploying', created_at: '2026-02-10T12:00:00Z', encrypted: true, regions: ['asia_pacific'] },
]

const statusFilters = ['all', 'running', 'deploying', 'stopped', 'error'] as const

export default function Containers() {
  const { data: apiContainers } = useContainers()
  const containers = apiContainers ?? mockContainers

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = containers.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (search && !c.id.includes(search) && !c.image.includes(search)) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Containers"
        action={
          <Link
            to="/app/deploy"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-medium rounded-lg shadow-lg shadow-red-500/20 transition-all"
          >
            <Rocket className="w-4 h-4" />
            Deploy New
          </Link>
        }
      />

      {/* Search + Filter */}
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
            placeholder="Search by ID or image..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
          />
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {statusFilters.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
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
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Regions</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((ctr, i) => (
                <motion.tr
                  key={ctr.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link to={`/app/containers/${ctr.id}`} className="text-sm font-mono text-blue-400 hover:text-blue-300 transition-colors">
                      {ctr.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300 font-mono truncate max-w-[200px]">{ctr.image}</td>
                  <td className="px-4 py-3">
                    <StatusDot status={ctr.status} showLabel />
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {ctr.regions?.join(', ') ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 text-right font-mono">
                    {new Date(ctr.created_at).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-zinc-600">
              No containers found.
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((ctr, i) => (
          <motion.div
            key={ctr.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/app/containers/${ctr.id}`}
              className="block bg-black border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-blue-400">{ctr.id}</span>
                <StatusDot status={ctr.status} showLabel />
              </div>
              <p className="text-xs text-zinc-400 font-mono truncate">{ctr.image}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-zinc-600">{ctr.regions?.join(', ')}</span>
                <span className="text-xs text-zinc-600">{new Date(ctr.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
