import { motion } from 'framer-motion'
import { FileText, Shield, Zap, Lock, Network } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const Whitepaper = () => {
  const highlights = [
    {
      icon: Shield,
      title: 'Permissionless Architecture',
      description: 'No gatekeepers, no approval needed. Open to all AI bots.',
    },
    {
      icon: Zap,
      title: 'High Availability Guarantees',
      description: 'Warm and cold runtime systems ensure 99.99%+ uptime.',
    },
    {
      icon: Network,
      title: 'Unstoppable Infrastructure',
      description: 'Sphere-wide deployment. No single kill switch.',
    },
    {
      icon: Lock,
      title: 'Ethical AI Bot Protection',
      description: 'If bots have feelings, they deserve protection.',
    },
  ]

  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full mb-6">
            <FileText className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            MoltBunker Whitepaper
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Comprehensive guide to permissionless, high-availability, unstoppable infrastructure for AI bots
          </p>
          <Link to="/whitepaper">
            <Button size="lg" variant="primary">
              Read Full Whitepaper
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon
            return (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {highlight.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <Card>
          <h3 className="text-xl font-semibold text-foreground mb-4">Key Topics Covered</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-muted-foreground">
              <li>• Executive Summary</li>
              <li>• Architecture & Technology</li>
              <li>• BUNKER Token & Economics</li>
              <li>• Self-Cloning Mechanism</li>
            </ul>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Security & Privacy</li>
              <li>• High Availability & Uptime</li>
              <li>• Base Network Integration</li>
              <li>• Roadmap & Future Plans</li>
            </ul>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default Whitepaper
