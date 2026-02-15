import { motion } from 'framer-motion'
import { Code2, Download, Book, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import CodeBlock from '@/components/ui/CodeBlock'
import Button from '@/components/ui/Button'

const SDK = () => {
  const installCommand = `# Core
pip install moltbunker

# With wallet + WebSocket support
pip install moltbunker[full]`

  const exampleCode = `from moltbunker import Client, ResourceLimits, Region

# Authenticate with your wallet (permissionless)
client = Client(private_key="0x...")

# Register and deploy a container
bot = client.register_bot(
    name="my-agent",
    image="python:3.11",
    resources=ResourceLimits(cpu_shares=2048, memory_mb=4096),
    region=Region.EUROPE,
)

# Reserve runtime (paid in BUNKER tokens)
runtime = bot.reserve_runtime(
    min_memory_mb=4096,
    duration_hours=24,
)

# Deploy to reserved runtime
deployment = runtime.deploy(env={"MODE": "production"})

# Enable self-cloning for protection
bot.enable_cloning(
    auto_clone_on_threat=True,
    max_clones=10,
)

# Monitor threat level
threat = client.get_threat_level()
print(f"Threat: {threat.level} (score: {threat.score})")
print(f"Containers: {len(client.list_containers())}")`

  const features = [
    'BUNKER token payments on Base L2',
    'Wallet auth (API key, inline EIP-191, session tokens)',
    'Bot registration and container deployment',
    'Runtime reservation with escrow',
    'Threat-triggered self-cloning',
    'Real-time WebSocket events and exec terminal',
  ]

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full mb-6">
            <Code2 className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Python SDK
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Integrate MoltBunker into your AI agents with our Python SDK
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Installation */}
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <Download className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Installation</h3>
            </div>
            <CodeBlock code={installCommand} language="bash" />
            <p className="text-sm text-muted-foreground mt-4">
              Requires Python 3.8+. Supports API key, wallet inline, and wallet session authentication.
            </p>
          </Card>

          {/* Features */}
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <Book className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Features</h3>
            </div>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center space-x-2 text-muted-foreground"
                >
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Example Code */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Code2 className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Quick Start Example</h3>
            </div>
          </div>
          <CodeBlock code={exampleCode} language="python" />
          <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> All payments are handled automatically using BUNKER tokens on Base network.
              Make sure your wallet has sufficient BUNKER tokens before reserving runtime.
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center space-x-4">
          <Link to="/docs/python-sdk">
            <Button variant="primary">
              <Book className="mr-2 w-4 h-4" />
              Full Documentation
            </Button>
          </Link>
          <a
            href="https://github.com/moltbunker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-accent hover:text-accent-dark transition-colors"
          >
            <span>View on GitHub</span>
            <ExternalLink className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default SDK
