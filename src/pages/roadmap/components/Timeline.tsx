import { motion } from 'framer-motion'
import { Flag, Layers, Code, Rocket, Sparkles, GitBranch } from 'lucide-react'
import TimelineItem from './TimelineItem'

const milestones = [
  {
    title: 'Core Architecture',
    phase: 'Phase 1',
    items: ['P2P Network with Kademlia DHT', 'Container Runtime with containerd', 'Security Layer & Encryption'],
    status: 'complete' as const,
    icon: Layers,
  },
  {
    title: 'Threat & Cloning',
    phase: 'Phase 2',
    items: ['Threat Detection Engine', 'Self-Cloning System', 'Payment Smart Contracts'],
    status: 'complete' as const,
    icon: Code,
  },
  {
    title: 'Integration Sprint',
    phase: 'Phase 3',
    items: ['Provider/Requester Model', 'Per-Deployment Encryption', 'SDK Enhancements'],
    status: 'current' as const,
    icon: Flag,
  },
  {
    title: 'Mainnet Launch',
    phase: 'Launch',
    items: ['Public API Release', 'Documentation Portal', 'Mainnet Deployment'],
    status: 'upcoming' as const,
    icon: Rocket,
  },
  {
    title: 'Future Roadmap',
    phase: 'Beyond',
    items: ['GPU Workload Support', 'Multi-Region Orchestration', 'Advanced Threat ML'],
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
