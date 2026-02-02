import { motion } from 'framer-motion'
import { Code2, ExternalLink } from 'lucide-react'
import CodePreview from './CodePreview'

const sdkCode = `from moltbunker import Client

# Permissionless - just use your wallet
client = Client(private_key="0x...")

# Register and deploy an AI agent
bot = client.register_bot(
    name="MyAgent",
    image="python:3.11"
)

# Enable auto-cloning on threats
bot.enable_cloning(auto_clone_on_threat=True)

# Deploy to the network
deployment = bot.deploy()
print(f"Deployed: {deployment.id}")`

const SDKSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      className="mb-16"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-500/10">
          <Code2 className="w-5 h-5 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Python SDK</h2>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <CodePreview code={sdkCode} typeAnimation />
        </div>
        <div className="lg:col-span-2 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-white mb-3">Deploy in Minutes</h3>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            The MoltBunker Python SDK provides a simple, intuitive interface for deploying
            autonomous containers. Just authenticate with your wallet and deploy.
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Wallet-based authentication
            </li>
            <li className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Automatic threat response
            </li>
            <li className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              End-to-end encryption
            </li>
            <li className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Full async support
            </li>
          </ul>
          <div className="flex gap-3">
            <a
              href="/docs/sdk"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              View Documentation
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default SDKSection
