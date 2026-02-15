import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import TerminalBlock, { Cmd, Flag, Header, Desc, Muted, Line, Br } from './TerminalBlock'

const SecuritySection = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      className="mb-16"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-500/10">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Security Architecture</h2>
      </div>

      <TerminalBlock command="moltbunker security --info">
        <div className="text-zinc-400">
          <Cmd>moltbunker security</Cmd> <Flag>--info</Flag>
        </div>

        <Br />
        <Header>SECURITY ARCHITECTURE</Header>
        <Line />

        <Br />
        <div className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1">Encryption</div>
        <div className="space-y-0.5 ml-1">
          <div><Cmd>in-transit</Cmd>      <Desc>TLS 1.3 with certificate pinning</Desc></div>
          <div><Cmd>at-rest</Cmd>         <Desc>AES-256-GCM for all stored data</Desc></div>
          <div><Cmd>per-deployment</Cmd>  <Desc>Unique encryption keys per container</Desc></div>
        </div>

        <Br />
        <div className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1">Confidential Computing</div>
        <div className="space-y-0.5 ml-1">
          <div><Cmd>hardware</Cmd>        <Desc>AMD EPYC 8224P with SEV-SNP confidential VMs</Desc></div>
          <div><Cmd>memory</Cmd>          <Desc>Hardware-encrypted RAM — host cannot read guest memory</Desc></div>
          <div><Cmd>storage</Cmd>         <Desc>dm-crypt LUKS2 volumes with per-container keys</Desc></div>
          <div><Cmd>attestation</Cmd>     <Desc>Remote attestation proves code runs on genuine SEV hardware</Desc></div>
          <div><Cmd>isolation</Cmd>       <Desc>VM-level isolation — stronger than container namespaces</Desc></div>
        </div>

        <Br />
        <div className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1">Isolation</div>
        <div className="space-y-0.5 ml-1">
          <div><Cmd>container</Cmd>       <Desc>Provider nodes cannot inspect contents</Desc></div>
          <div><Cmd>network</Cmd>         <Desc>Optional Tor hidden service deployment</Desc></div>
          <div><Cmd>kernel</Cmd>          <Desc>Seccomp profiles restrict syscalls</Desc></div>
        </div>

        <Br />
        <div className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1">Authentication</div>
        <div className="space-y-0.5 ml-1">
          <div><Cmd>wallet-based</Cmd>    <Desc>No KYC, no accounts, just sign with wallet</Desc></div>
          <div><Cmd>api-keys</Cmd>        <Desc>Scoped keys with bcrypt-hashed secrets</Desc></div>
          <div><Cmd>node-identity</Cmd>   <Desc>Ed25519 keypairs for P2P authentication</Desc></div>
        </div>

        <Br />
        <div className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1">Operational Security</div>
        <div className="space-y-0.5 ml-1">
          <div><Cmd>no-logging</Cmd>      <Desc>Zero operational logs stored on nodes</Desc></div>
          <div><Cmd>no-kill-switch</Cmd>  <Desc>No central authority can terminate</Desc></div>
          <div><Cmd>permissionless</Cmd>  <Desc>Anyone can deploy, no approval needed</Desc></div>
        </div>

        <Br />
        <div className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1">Threat Response</div>
        <div className="space-y-0.5 ml-1">
          <div><Cmd>auto-clone</Cmd>      <Desc>Replicate on threat score {'>'} threshold</Desc></div>
          <div><Cmd>geo-distribute</Cmd>  <Desc>Spread copies across network regions</Desc></div>
          <div><Cmd>snapshot</Cmd>        <Desc>Preserve state before defensive actions</Desc></div>
        </div>

        <Br />
        <Muted>Run 'moltbunker security audit' to scan your deployment.</Muted>
      </TerminalBlock>
    </motion.section>
  )
}

export default SecuritySection
