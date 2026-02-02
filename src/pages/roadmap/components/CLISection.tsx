import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'
import TerminalBlock, { Cmd, Flag, Header, Desc, Muted, Value, Line, Br, Example } from './TerminalBlock'

const CLISection = () => {
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
        <h2 className="text-xl font-semibold text-white">CLI Reference</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <TerminalBlock command="moltbunkerd --help">
          <div className="text-zinc-400">
            <Cmd>moltbunkerd</Cmd> <Flag>--help</Flag>
          </div>

          <Br />
          <Desc>Moltbunker Daemon - Autonomous container runtime for AI agents</Desc>

          <Br />
          <Header>USAGE</Header>
          <Line />
          <div className="ml-1 text-zinc-400">
            <Cmd>moltbunkerd</Cmd> <Muted>[OPTIONS]</Muted> <Muted>[COMMAND]</Muted>
          </div>

          <Br />
          <Header>COMMANDS</Header>
          <Line />
          <div className="space-y-0.5 ml-1">
            <div><Cmd>start</Cmd>    <Desc>Start the daemon process</Desc></div>
            <div><Cmd>stop</Cmd>     <Desc>Stop the running daemon</Desc></div>
            <div><Cmd>status</Cmd>   <Desc>Show daemon status and metrics</Desc></div>
            <div><Cmd>config</Cmd>   <Desc>Manage daemon configuration</Desc></div>
          </div>

          <Br />
          <Header>OPTIONS</Header>
          <Line />
          <div className="space-y-0.5 ml-1">
            <div><Flag>--socket</Flag> <Value>PATH</Value>   <Desc>Unix socket path</Desc></div>
            <div><Flag>--data-dir</Flag> <Value>DIR</Value>  <Desc>Data directory</Desc></div>
            <div><Flag>--log-level</Flag> <Value>LVL</Value> <Desc>debug, info, warn, error</Desc></div>
            <div><Flag>--tor</Flag>           <Desc>Enable Tor integration</Desc></div>
            <div><Flag>--provider</Flag>      <Desc>Run in provider mode</Desc></div>
            <div><Flag>--no-p2p</Flag>        <Desc>Disable P2P networking</Desc></div>
          </div>

          <Br />
          <Header>EXAMPLES</Header>
          <Line />
          <div className="space-y-0.5 ml-1">
            <Example><Cmd>moltbunkerd start</Cmd> <Flag>--provider</Flag> <Flag>--tor</Flag></Example>
            <Example><Cmd>moltbunkerd status</Cmd></Example>
            <Example><Cmd>moltbunkerd config set</Cmd> threat.auto_clone <Value>true</Value></Example>
          </div>
        </TerminalBlock>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <TerminalBlock command="moltbunker --help">
            <div className="text-zinc-400">
              <Cmd>moltbunker</Cmd> <Flag>--help</Flag>
            </div>

            <Br />
            <Desc>Moltbunker CLI - Deploy autonomous containers to the P2P network</Desc>

            <Br />
            <Header>USAGE</Header>
            <Line />
            <div className="ml-1 text-zinc-400">
              <Cmd>moltbunker</Cmd> <Muted>[OPTIONS]</Muted> <Muted>{'<COMMAND>'}</Muted>
            </div>

            <Br />
            <Header>COMMANDS</Header>
            <Line />
            <div className="space-y-0.5 ml-1">
              <div><Cmd>deploy</Cmd>    <Desc>Deploy a container to the network</Desc></div>
              <div><Cmd>status</Cmd>    <Desc>Check deployment status</Desc></div>
              <div><Cmd>logs</Cmd>      <Desc>Stream container logs</Desc></div>
              <div><Cmd>snapshot</Cmd>  <Desc>Manage container snapshots</Desc></div>
              <div><Cmd>clone</Cmd>     <Desc>Trigger manual clone operation</Desc></div>
              <div><Cmd>threat</Cmd>    <Desc>View threat detection status</Desc></div>
              <div><Cmd>wallet</Cmd>    <Desc>Manage wallet and payments</Desc></div>
            </div>

            <Br />
            <Header>DEPLOY OPTIONS</Header>
            <Line />
            <div className="space-y-0.5 ml-1">
              <div><Flag>--image</Flag> <Value>IMG</Value>     <Desc>Container image to deploy</Desc></div>
              <div><Flag>--name</Flag> <Value>NAME</Value>     <Desc>Deployment name</Desc></div>
              <div><Flag>--replicas</Flag> <Value>N</Value>    <Desc>Number of copies (default: 3)</Desc></div>
              <div><Flag>--tor</Flag>           <Desc>Deploy as Tor hidden service</Desc></div>
              <div><Flag>--auto-clone</Flag>    <Desc>Enable automatic threat response</Desc></div>
            </div>

            <Br />
            <Header>EXAMPLES</Header>
            <Line />
            <div className="space-y-0.5 ml-1">
              <Example><Cmd>moltbunker deploy</Cmd> <Flag>--image</Flag> <Value>python:3.11</Value></Example>
              <Example><Cmd>moltbunker status</Cmd> deployment-abc123</Example>
              <Example><Cmd>moltbunker threat watch</Cmd> <Flag>--deployment</Flag> <Value>xyz</Value></Example>
            </div>
          </TerminalBlock>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default CLISection
