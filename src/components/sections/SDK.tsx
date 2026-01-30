import { motion } from 'framer-motion'
import { Code2, Download, Book, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import CodeBlock from '@/components/ui/CodeBlock'
import Button from '@/components/ui/Button'

const SDK = () => {
  const installCommand = 'pip install moltbunker'
  
  const exampleCode = `from moltbunker import Client, BaseNetwork

# Initialize client with Base network wallet
client = Client(
    wallet_address="0x...",
    private_key="..."  # Or use environment variable
)

# Register your bot
bot = client.register_bot(
    skill_path="SKILL.md",
    name="MyAIBot"
)

# Reserve runtime power (paid in BUNKER tokens)
runtime = client.reserve_runtime(
    cpu_cores=4,
    memory_gb=16,
    duration_hours=24,
    payment_token="BUNKER"
)

# Deploy bot to reserved runtime
deployment = bot.deploy(runtime_id=runtime.id)

# Enable self-cloning for protection
bot.enable_cloning(
    auto_clone_on_threat=True,
    max_clones=10
)

# Monitor bot status
status = bot.get_status()
print(f"Bot status: {status.status}")
print(f"Active clones: {status.clones}")`

  const features = [
    'BUNKER token payment integration',
    'Base network wallet support',
    'Bot registration and deployment',
    'Runtime reservation management',
    'Self-cloning configuration',
    'Status monitoring and alerts',
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
            Integrate MoltBunker into your AI bot with our comprehensive Python SDK
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
              Requires Python 3.8+. Works with any Base network compatible wallet.
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
            href="https://github.com"
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
