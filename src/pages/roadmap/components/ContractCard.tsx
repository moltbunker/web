import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

interface ContractCardProps {
  title: string
  address: string
  status: 'live' | 'coming'
  icon: React.ElementType
  network?: 'mainnet' | 'sepolia'
}

const ContractCard = ({ title, address, status, icon: Icon, network = 'mainnet' }: ContractCardProps) => {
  const explorerBase = network === 'sepolia' ? 'https://sepolia.basescan.org' : 'https://basescan.org'
  const networkLabel = network === 'sepolia' ? 'Live on Base Sepolia' : 'Live on Base'

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm hover:border-zinc-700 transition-colors"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${status === 'live' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          <Icon className={`w-5 h-5 ${status === 'live' ? 'text-emerald-400' : 'text-red-400'}`} />
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <span className={`text-xs font-medium ${status === 'live' ? 'text-emerald-400' : 'text-red-400'}`}>
            {status === 'live' ? networkLabel : 'Coming Soon'}
          </span>
        </div>
      </div>
    </div>

    {status === 'live' ? (
      <div className="flex items-center gap-2">
        <code className="flex-1 text-sm bg-zinc-800/50 px-3 py-2 rounded-lg text-zinc-300 truncate" style={{ fontFamily: 'var(--font-mono)' }}>
          {address}
        </code>
        <a
          href={`${explorerBase}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    ) : (
      <div className="text-sm bg-zinc-800/30 px-3 py-2 rounded-lg text-zinc-500" style={{ fontFamily: 'var(--font-mono)' }}>
        {address}
      </div>
    )}
  </motion.div>
  )
}

export default ContractCard
