import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'
import TerminalBlock, { Cmd, Flag, Header, Desc, Muted, Line, Br, Example } from './TerminalBlock'

const FeaturesSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      className="mb-16"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-500/10">
          <Terminal className="w-5 h-5 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Core Features</h2>
      </div>

      <TerminalBlock command="moltbunker features --list">
        <div className="text-zinc-400">
          <Cmd>moltbunker features</Cmd> <Flag>--list</Flag>
        </div>

        <Br />
        <Header>CORE FEATURES</Header>
        <Line />

        <div className="space-y-0.5 ml-1">
          <div><Cmd>self-clone</Cmd>      <Desc>Auto-replicate containers on threat detection</Desc></div>
          <div><Cmd>threat-detect</Cmd>   <Desc>Real-time scoring (0.0-1.0) with network probes</Desc></div>
          <div><Cmd>p2p-network</Cmd>     <Desc>Kademlia DHT with libp2p for decentralization</Desc></div>
          <div><Cmd>tor-integration</Cmd> <Desc>Onion services & hidden service endpoints</Desc></div>
          <div><Cmd>snapshots</Cmd>       <Desc>Full, incremental & checkpoint state capture</Desc></div>
          <div><Cmd>container-rt</Cmd>    <Desc>Confidential containers on AMD SEV-SNP hardware</Desc></div>
          <div><Cmd>payments</Cmd>        <Desc>BUNKER token payments on Base L2</Desc></div>
          <div><Cmd>redundancy</Cmd>      <Desc>3-copy geographic distribution across nodes</Desc></div>
        </div>

        <Br />
        <Header>FLAGS</Header>
        <Line />

        <div className="space-y-0.5 ml-1">
          <div><Flag>--auto-clone</Flag>  <Desc>Enable automatic cloning on threat score {'>'} 0.7</Desc></div>
          <div><Flag>--tor</Flag>         <Desc>Route all traffic through Tor network</Desc></div>
          <div><Flag>--encrypt</Flag>     <Desc>Enable per-deployment encryption keys</Desc></div>
          <div><Flag>--snapshot</Flag>    <Desc>Create checkpoint before operations</Desc></div>
        </div>

        <Br />
        <Header>EXAMPLES</Header>
        <Line />

        <div className="space-y-0.5 ml-1">
          <Example><Cmd>moltbunker deploy</Cmd> <Flag>--auto-clone</Flag> <Flag>--tor</Flag> myagent:latest</Example>
          <Example><Cmd>moltbunker snapshot create</Cmd> <Flag>--incremental</Flag> deployment-xyz</Example>
          <Example><Cmd>moltbunker threat status</Cmd> <Flag>--watch</Flag></Example>
        </div>

        <Br />
        <Muted>Run 'moltbunker {'<command>'} --help' for more information.</Muted>
      </TerminalBlock>
    </motion.section>
  )
}

export default FeaturesSection
