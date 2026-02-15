import { motion } from 'framer-motion'
import { Layers, Shield, FileCode, Terminal, Rocket, Globe, Sparkles, GitBranch } from 'lucide-react'
import TimelineItem from './TimelineItem'

const milestones = [
  {
    title: 'Core Infrastructure',
    phase: 'Phase 1',
    items: [
      'P2P network with Kademlia DHT and NAT traversal',
      'Confidential container runtime on AMD EPYC 8224P with SEV-SNP',
      'Hardware-encrypted memory — host OS cannot read guest RAM',
      'AES-256-GCM storage encryption with per-container LUKS2 volumes',
      'Snapshot system with 3-copy geographic replication',
    ],
    status: 'complete' as const,
    icon: Layers,
  },
  {
    title: 'Security & Resilience',
    phase: 'Phase 2',
    items: [
      'Threat detection engine with automated response',
      'Self-cloning system — replicate on threat detection',
      'Remote attestation proving genuine SEV-SNP hardware execution',
      'Full Tor integration with .onion hidden service support',
      'Per-deployment encryption with wallet-derived keys, TLS 1.3 in transit',
    ],
    status: 'complete' as const,
    icon: Shield,
  },
  {
    title: 'Smart Contracts',
    phase: 'Phase 3',
    items: [
      '8 protocol contracts deployed on Base Sepolia',
      '5-tier staking system with Synthetix-style rewards',
      'Job escrow with 3-provider selection and progressive release',
      'All contracts verified on Basescan — Feb 15, 2026',
    ],
    status: 'complete' as const,
    icon: FileCode,
  },
  {
    title: 'Platform & API',
    phase: 'Phase 4',
    items: [
      'HTTP API — 40+ endpoints for containers, billing, providers',
      'CLI with full command coverage for deployment and management',
      'E2E encrypted web terminal (WebSocket + AES-256-GCM)',
      'Requester mode — wallet auth, container deploy, auto-payment',
    ],
    status: 'complete' as const,
    icon: Terminal,
  },
  {
    title: 'Testnet Launch',
    phase: 'Phase 5',
    items: [
      'Base Sepolia deployment — Chain ID 84532',
      'BUNKER token live on Base mainnet',
      'Documentation portal with full protocol docs',
      'Testnet registration and onboarding flow',
    ],
    status: 'complete' as const,
    icon: Rocket,
  },
  {
    title: 'SDK & Provider Network',
    phase: 'Phase 6',
    items: [
      'Python SDK for programmatic agent deployment',
      'Provider mode — stake, serve compute, earn rewards',
      'P2P network hardening and performance optimization',
      'Threat detection ML model improvements',
    ],
    status: 'current' as const,
    icon: Globe,
  },
  {
    title: 'Mainnet',
    phase: 'Launch',
    items: [
      'Security audit and contract migration to Base mainnet',
      'Public provider onboarding program',
      'Production monitoring and incident response',
    ],
    status: 'upcoming' as const,
    icon: Rocket,
  },
  {
    title: 'Beyond',
    phase: 'Future',
    items: [
      'Chainlink oracle pricing for dynamic resource costs',
      'Delegation, reputation scoring (0-1000), and hardware verification contracts',
      'Expand confidential node fleet — more AMD SEV-SNP providers joining',
      'GPU workload support for AI model training and inference',
      'Multi-region orchestration with latency-aware scheduling',
      'Advanced threat ML with behavioral anomaly detection',
    ],
    status: 'upcoming' as const,
    icon: Sparkles,
  },
]

const Timeline = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      className="mb-16"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-500/10">
          <GitBranch className="w-5 h-5 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Development Timeline</h2>
      </div>

      <div className="relative">
        {milestones.map((milestone, index) => (
          <TimelineItem
            key={milestone.title}
            title={milestone.title}
            phase={milestone.phase}
            items={milestone.items}
            status={milestone.status}
            icon={milestone.icon}
            index={index}
            isLast={index === milestones.length - 1}
          />
        ))}
      </div>
    </motion.section>
  )
}

export default Timeline
