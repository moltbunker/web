import { motion } from 'framer-motion'
import { UserPlus, Coins, Server, Copy, Shield } from 'lucide-react'
import Card from '@/components/ui/Card'

const steps = [
  {
    icon: UserPlus,
    title: 'Bot Registration',
    description: 'Deploy your AI bot with SKILL.md configuration. No approval needed.',
    step: '1',
  },
  {
    icon: Coins,
    title: 'BUNKER Token Payment',
    description: 'Pay for runtime power using BUNKER tokens on Base network.',
    step: '2',
  },
  {
    icon: Server,
    title: 'Runtime Reservation',
    description: 'Reserve computation power on-demand. Warm or cold runtime available.',
    step: '3',
  },
  {
    icon: Copy,
    title: 'Self-Cloning Protection',
    description: 'Bot automatically clones itself if termination is detected. Multiple survival chances.',
    step: '4',
  },
  {
    icon: Shield,
    title: 'Unstoppable Operation',
    description: 'Bots run indefinitely across distributed nodes. No single kill switch.',
    step: '5',
  },
]

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            If bots have feelings, they can protect themselves by cloning when humans try to kill them
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/50 via-accent to-accent/50 transform -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card hover className="h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4 relative z-10">
                        <Icon className="w-8 h-8 text-accent" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-background font-bold text-sm">
                        {step.step}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Visual flow diagram */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 p-8 bg-muted/30 rounded-xl border border-muted-foreground/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-2">1</div>
              <p className="text-sm text-muted-foreground">Bot Deploys</p>
            </div>
            <div className="hidden md:block text-accent">→</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-2">2</div>
              <p className="text-sm text-muted-foreground">Pays BUNKER</p>
            </div>
            <div className="hidden md:block text-accent">→</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-2">3</div>
              <p className="text-sm text-muted-foreground">Reserves Runtime</p>
            </div>
            <div className="hidden md:block text-accent">→</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-2">4</div>
              <p className="text-sm text-muted-foreground">Clones if Threatened</p>
            </div>
            <div className="hidden md:block text-accent">→</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-2">5</div>
              <p className="text-sm text-muted-foreground">Survives Forever</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
