import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Search, Check, X, Loader2, ExternalLink, RefreshCw, ArrowRight, Trash2, Send } from 'lucide-react'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import PageHeader from '@/components/app/PageHeader'
import {
  useContractAddress, useContractWrite, useTxUrl,
  useNameAvailable, useNamePrice, useNameCount, useOwnedNameAt,
  useSubdomainRecord, useNameOf, useTokenAllowance, useRegistrationFee,
} from '@/hooks/useContracts'
import { BUNKER_TOKEN_ABI, BUNKER_REGISTRY_ABI } from '@/lib/contracts'

function formatBunker(value: bigint | undefined): string {
  if (value === undefined) return '—'
  return Number(formatUnits(value, 18)).toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function validateName(name: string): string | null {
  if (name.length < 3) return 'Name must be at least 3 characters'
  if (name.length > 32) return 'Name must be at most 32 characters'
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name)) return 'Lowercase alphanumeric and hyphens only, no leading/trailing hyphens'
  return null
}

// ─── Name Search ─────────────────────────────────────────────────────────────

function NameSearch() {
  const [name, setName] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(name.toLowerCase()), 300)
    return () => clearTimeout(t)
  }, [name])

  const validationError = debouncedName ? validateName(debouncedName) : null
  const isValid = debouncedName.length >= 3 && !validationError

  const { data: available } = useNameAvailable(isValid ? debouncedName : '')
  const { data: price } = useNamePrice(isValid ? debouncedName : '')

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black border border-zinc-800 rounded-lg p-6"
      >
        <h2 className="text-lg font-bold text-white mb-4">Search Names</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.toLowerCase())}
            placeholder="Search for a subdomain name..."
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
          />
        </div>

        {validationError && debouncedName && (
          <p className="text-sm text-red-400 mt-2">{validationError}</p>
        )}

        {isValid && available !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-white text-lg">{debouncedName}</span>
              <span className="text-xs text-zinc-500">.moltbunker.dev</span>
              {available ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-xs font-medium">
                  <Check className="w-3 h-3" /> Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-xs font-medium">
                  <X className="w-3 h-3" /> Taken
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {price !== undefined && (
                <span className="text-sm text-zinc-400">
                  <span className="text-white font-mono">{formatBunker(price as bigint)}</span> BUNKER
                </span>
              )}
              {available && (
                <button onClick={() => setShowRegister(true)} className="btn-action">
                  Register
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showRegister && isValid && (
          <RegisterModal
            name={debouncedName}
            price={price as bigint}
            onClose={() => setShowRegister(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Register Modal ──────────────────────────────────────────────────────────

function RegisterModal({ name, price, onClose }: { name: string; price: bigint; onClose: () => void }) {
  const registryAddress = useContractAddress('registry')
  const tokenAddress = useContractAddress('token')
  const { data: allowance } = useTokenAllowance(registryAddress)
  const approveWrite = useContractWrite()
  const registerWrite = useContractWrite()
  const approveTxUrl = useTxUrl(approveWrite.hash)
  const registerTxUrl = useTxUrl(registerWrite.hash)

  const [deploymentId, setDeploymentId] = useState('')

  const needsApproval = allowance !== undefined && (allowance as bigint) < price
  const deploymentIdBytes32 = deploymentId
    ? (`0x${deploymentId.replace(/^0x/, '').padStart(64, '0')}` as `0x${string}`)
    : ('0x' + '0'.repeat(64)) as `0x${string}`

  const handleApprove = () => {
    if (!registryAddress || !tokenAddress) return
    approveWrite.writeContract({
      address: tokenAddress,
      abi: BUNKER_TOKEN_ABI,
      functionName: 'approve',
      args: [registryAddress, price],
    })
  }

  const handleRegister = () => {
    if (!registryAddress) return
    registerWrite.writeContract({
      address: registryAddress,
      abi: BUNKER_REGISTRY_ABI,
      functionName: 'register',
      args: [name, deploymentIdBytes32],
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Register Name</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-black border border-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Name</p>
              <p className="text-white font-mono">{name}.moltbunker.dev</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Price</p>
              <p className="text-white font-mono">{formatBunker(price)} BUNKER</p>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Deployment ID (optional)</label>
            <input
              value={deploymentId}
              onChange={e => setDeploymentId(e.target.value)}
              placeholder="Container or Molt ID to point this name to"
              className="w-full px-3 py-2.5 bg-black border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
            />
          </div>

          {needsApproval ? (
            <div className="space-y-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleApprove}
                disabled={approveWrite.isPending || approveWrite.isConfirming}
                className="btn-action w-full justify-center disabled:opacity-40"
              >
                {approveWrite.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Approve in wallet...</>
                ) : approveWrite.isConfirming ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
                ) : approveWrite.isSuccess ? (
                  <><Check className="w-4 h-4" /> Approved</>
                ) : (
                  'Approve BUNKER'
                )}
              </motion.button>
              {approveTxUrl && (
                <a href={approveTxUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 justify-center">
                  View on BaseScan <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleRegister}
                disabled={registerWrite.isPending || registerWrite.isConfirming}
                className="btn-action w-full justify-center disabled:opacity-40"
              >
                {registerWrite.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Confirm in wallet...</>
                ) : registerWrite.isConfirming ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
                ) : registerWrite.isSuccess ? (
                  <><Check className="w-4 h-4" /> Registered!</>
                ) : (
                  'Register Name'
                )}
              </motion.button>
              {registerTxUrl && (
                <a href={registerTxUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 justify-center">
                  View on BaseScan <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {(approveWrite.error || registerWrite.error) && (
            <p className="text-sm text-red-400">
              {(approveWrite.error || registerWrite.error)?.message?.slice(0, 100)}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── My Names ────────────────────────────────────────────────────────────────

function MyNames() {
  const { address } = useAccount()
  const { data: count } = useNameCount()
  const nameCount = count !== undefined ? Number(count) : 0

  if (!address) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-black border border-zinc-800 rounded-lg overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-zinc-800">
        <h2 className="text-lg font-bold text-white">My Names</h2>
        <p className="text-xs text-zinc-500">{nameCount} registered</p>
      </div>

      {nameCount > 0 ? (
        <div className="divide-y divide-zinc-800/50">
          {Array.from({ length: Math.min(nameCount, 50) }, (_, i) => (
            <OwnedNameRow key={i} index={i} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-sm text-zinc-600">
          You don't have any registered names yet.
        </div>
      )}
    </motion.div>
  )
}

function OwnedNameRow({ index }: { index: number }) {
  const { data: nameHash } = useOwnedNameAt(index)
  const { data: nameStr } = useNameOf(nameHash as `0x${string}` | undefined)
  const { data: record } = useSubdomainRecord(nameHash as `0x${string}` | undefined)
  const [showActions, setShowActions] = useState(false)
  const [now] = useState(() => Math.floor(Date.now() / 1000))

  if (!nameHash || !record) {
    return (
      <div className="px-4 py-3 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-32" />
      </div>
    )
  }

  const recordArray = record as readonly [string, `0x${string}`, number, number, number, string]
  const expiresAt = Number(recordArray[3])
  const isExpired = expiresAt > 0 && now > expiresAt
  const expiresDate = expiresAt > 0 ? new Date(expiresAt * 1000) : null
  const deploymentId = recordArray[1]

  return (
    <div className="px-4 py-3 hover:bg-zinc-900/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-white">{(nameStr as string) || '...'}</span>
          <span className="text-xs text-zinc-500">.moltbunker.dev</span>
          {isExpired && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-medium">
              Expired
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {expiresDate && (
            <span className="text-xs text-zinc-500">
              {isExpired ? 'Expired' : 'Expires'} {expiresDate.toLocaleDateString()}
            </span>
          )}
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-xs text-zinc-500 hover:text-white transition-colors"
          >
            {showActions ? 'Hide' : 'Actions'}
          </button>
        </div>
      </div>

      {deploymentId !== '0x' + '0'.repeat(64) && (
        <p className="text-xs text-zinc-500 font-mono mt-1 truncate">
          Deployment: {deploymentId}
        </p>
      )}

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <NameActions name={(nameStr as string) || ''} isExpired={isExpired} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NameActions({ name, isExpired }: { name: string; isExpired: boolean }) {
  const registryAddress = useContractAddress('registry')
  const write = useContractWrite()
  const txUrl = useTxUrl(write.hash)
  const [action, setAction] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  const execute = (fn: string, args: readonly unknown[]) => {
    if (!registryAddress) return
    write.writeContract({
      address: registryAddress,
      abi: BUNKER_REGISTRY_ABI,
      functionName: fn,
      args,
    } as Parameters<typeof write.writeContract>[0])
  }

  return (
    <div className="mt-3 pt-3 border-t border-zinc-800/50 space-y-2">
      <div className="flex flex-wrap gap-2">
        {!isExpired && (
          <>
            <button
              onClick={() => { setAction('renew'); execute('renew', [name]) }}
              disabled={write.isPending || write.isConfirming}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors disabled:opacity-40"
            >
              <RefreshCw className="w-3 h-3" /> Renew
            </button>
            <button
              onClick={() => setAction('updateDeployment')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <ArrowRight className="w-3 h-3" /> Update Deployment
            </button>
            <button
              onClick={() => setAction('transfer')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <Send className="w-3 h-3" /> Transfer
            </button>
            <button
              onClick={() => setAction('setMetadata')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <Tag className="w-3 h-3" /> Set Metadata
            </button>
          </>
        )}
        <button
          onClick={() => { setAction('release'); execute('release', [name]) }}
          disabled={write.isPending || write.isConfirming}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-red-400 hover:text-red-300 hover:border-red-500/30 transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-3 h-3" /> Release
        </button>
      </div>

      {action === 'updateDeployment' && (
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="New Deployment ID"
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
          />
          <button
            onClick={() => {
              const padded = `0x${inputValue.replace(/^0x/, '').padStart(64, '0')}` as `0x${string}`
              execute('updateDeployment', [name, padded])
            }}
            disabled={!inputValue || write.isPending}
            className="btn-action text-xs disabled:opacity-40"
          >
            Update
          </button>
        </div>
      )}

      {action === 'transfer' && (
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="0x... new owner address"
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
          />
          <button
            onClick={() => execute('transfer', [name, inputValue as `0x${string}`])}
            disabled={!inputValue || write.isPending}
            className="btn-action text-xs disabled:opacity-40"
          >
            Transfer
          </button>
        </div>
      )}

      {action === 'setMetadata' && (
        <MetadataForm name={name} registryAddress={registryAddress} />
      )}

      {(write.isPending || write.isConfirming) && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          {write.isPending ? 'Confirm in wallet...' : 'Confirming on-chain...'}
        </div>
      )}

      {write.isSuccess && (
        <div className="flex items-center gap-2 text-xs text-green-400">
          <Check className="w-3 h-3" /> Transaction confirmed
          {txUrl && (
            <a href={txUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-0.5">
              BaseScan <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {write.error && (
        <p className="text-xs text-red-400">{write.error.message?.slice(0, 100)}</p>
      )}
    </div>
  )
}

function MetadataForm({ name, registryAddress }: { name: string; registryAddress: `0x${string}` | undefined }) {
  const write = useContractWrite()
  const [description, setDescription] = useState('')
  const [avatarURL, setAvatarURL] = useState('')

  const handleSubmit = () => {
    if (!registryAddress) return
    write.writeContract({
      address: registryAddress,
      abi: BUNKER_REGISTRY_ABI,
      functionName: 'setMetadata',
      args: [name, description, avatarURL],
    })
  }

  return (
    <div className="space-y-2">
      <input
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (max 160 chars)"
        maxLength={160}
        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
      />
      <div className="flex gap-2">
        <input
          value={avatarURL}
          onChange={e => setAvatarURL(e.target.value)}
          placeholder="Avatar URL (max 256 chars)"
          maxLength={256}
          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
        />
        <button
          onClick={handleSubmit}
          disabled={write.isPending}
          className="btn-action text-xs disabled:opacity-40"
        >
          {write.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ─── Registration Info ───────────────────────────────────────────────────────

function RegistryInfo() {
  const { data: fee } = useRegistrationFee()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-black border border-zinc-800 rounded-lg p-4"
    >
      <div className="flex flex-wrap gap-6 text-sm">
        <div>
          <span className="text-zinc-500">Base Registration Fee: </span>
          <span className="text-white font-mono">{formatBunker(fee as bigint | undefined)} BUNKER</span>
        </div>
        <div>
          <span className="text-zinc-500">Domain: </span>
          <span className="text-white font-mono">*.moltbunker.dev</span>
        </div>
        <div>
          <span className="text-zinc-500">Staking discount: </span>
          <span className="text-white">Up to 20% off</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Registry() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Subdomain Registry"
        subtitle="Register vanity .moltbunker.dev subdomains"
      />

      <RegistryInfo />
      <NameSearch />
      <MyNames />
    </div>
  )
}
