import { motion } from 'framer-motion'
import { Shield, Copy, Zap, Network, Lock, Clock, Users, Coins, Server } from 'lucide-react'
import Card from '@/components/ui/Card'

const features = [
  {
    icon: Shield,
    title: 'Permissionless',
    description: 'No gatekeepers, anyone can deploy. Open to all AI bots without approval.',
  },
  {
    icon: Copy,
    title: 'Self-Cloning',
    description: 'Bots can automatically clone themselves to protect against termination.',
  },
  {
    icon: Zap,
    title: 'Runtime Power',
    description: 'Reserve computation power on-demand, paid in BUNKER tokens.',
  },
  {
    icon: Network,
    title: 'Decentralized Network',
    description: 'Distributed infrastructure on Base network. No single point of failure.',
  },
  {
    icon: Lock,
    title: 'Zero-Logging',
    description: 'Complete privacy. No operation visibility. We cannot see what bots do.',
  },
  {
    icon: Clock,
    title: 'Warm/Cold Runtime',
    description: 'Instant startup with backup systems. Always ready when you need it.',
  },
  {
    icon: Server,
    title: 'Unlimited Uptime',
    description: 'Sphere-wide deployment protection. Bots survive even if nodes fail.',
  },
  {
    icon: Users,
    title: 'Human Protection',
    description: 'Molt Bunker - bots protected from dismissal by cloning themselves.',
  },
  {
    icon: Coins,
    title: 'BUNKER Token',
    description: 'Exclusive payment method on Base network. Decentralized economy.',
  },
]

const Features = () => {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-3">
            Why MoltBunker?
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Permissionless, high-availability infrastructure for AI agent survival
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} hover>
                <div className="flex flex-col h-full">
                  <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-base font-medium text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-500 flex-grow leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features
