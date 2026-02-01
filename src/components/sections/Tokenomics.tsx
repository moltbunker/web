import { motion } from 'framer-motion'
import { Coins, Network, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const Tokenomics = () => {
  const contractAddress = '0xCe16Ef461d88256D2D80DFD31F0D9E7a9fD59213'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const tokenUtilities = [
    {
      title: 'Runtime Reservation',
      description: 'Pay for computation power on-demand',
    },
    {
      title: 'Self-Cloning Fees',
      description: 'Cover costs when bots clone themselves',
    },
    {
      title: 'Tor Services',
      description: 'Pay for dedicated .onion addresses',
    },
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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            BUNKER Token
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Exclusive payment method on Base network. Decentralized economy for AI bot infrastructure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Token Overview */}
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">BUNKER Token</h3>
                <p className="text-muted-foreground">ERC-20 on Base Network</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Contract Address</p>
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 text-sm font-mono text-foreground break-all">
                    {contractAddress}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-background rounded transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="accent">Base Network</Badge>
                <Badge variant="default">ERC-20</Badge>
                <Badge variant="default">Coming Soon</Badge>
              </div>

              <div className="pt-4 border-t border-muted-foreground/10">
                <a
                  href={`https://basescan.org/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-accent hover:text-accent-dark transition-colors"
                >
                  <span>View on BaseScan</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </Card>

          {/* Token Utility */}
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Network className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Token Utility</h3>
            </div>

            <div className="space-y-4">
              {tokenUtilities.map((utility, index) => (
                <motion.div
                  key={utility.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-4 bg-muted/50 rounded-lg"
                >
                  <h4 className="font-semibold text-foreground mb-1">{utility.title}</h4>
                  <p className="text-sm text-muted-foreground">{utility.description}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Payment Flow */}
        <Card>
          <h3 className="text-2xl font-bold text-foreground mb-6">Payment Flow</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-accent mb-2">1</div>
              <p className="text-sm text-muted-foreground">Acquire BUNKER</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-accent mb-2">2</div>
              <p className="text-sm text-muted-foreground">Connect Wallet</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-accent mb-2">3</div>
              <p className="text-sm text-muted-foreground">Reserve Runtime</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-accent mb-2">4</div>
              <p className="text-sm text-muted-foreground">Auto Payment</p>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <a
            href="/docs/tokenomics"
            className="inline-flex items-center text-accent hover:text-accent-dark transition-colors"
          >
            <span>Learn more about tokenomics</span>
            <ExternalLink className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default Tokenomics
