export const CHAIN_IDS = {
  BASE_MAINNET: 8453,
  BASE_SEPOLIA: 84532,
  LOCAL: 31337,
} as const

// ── User-facing ABIs ─────────────────────────────────────────────────────────

export const BUNKER_TOKEN_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
] as const

export const BUNKER_STAKING_ABI = [
  { name: 'getStake', type: 'function', stateMutability: 'view', inputs: [{ name: 'provider', type: 'address' }], outputs: [{ name: 'amount', type: 'uint256' }] },
  { name: 'getTier', type: 'function', stateMutability: 'view', inputs: [{ name: 'provider', type: 'address' }], outputs: [{ name: 'tier', type: 'uint8' }] },
  { name: 'stake', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'requestUnstake', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'completeUnstake', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'earned', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
] as const

export const BUNKER_ESCROW_ABI = [
  { name: 'getReservation', type: 'function', stateMutability: 'view', inputs: [{ name: 'reservationId', type: 'bytes32' }], outputs: [{ name: 'requester', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'released', type: 'bool' }] },
  { name: 'createReservation', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }, { name: 'duration', type: 'uint256' }], outputs: [{ name: 'reservationId', type: 'uint256' }] },
] as const

// ── Event ABIs (for transaction history) ─────────────────────────────────────

export const TOKEN_TRANSFER_EVENT = {
  type: 'event', name: 'Transfer',
  inputs: [
    { name: 'from', type: 'address', indexed: true },
    { name: 'to', type: 'address', indexed: true },
    { name: 'value', type: 'uint256', indexed: false },
  ],
} as const

export const ESCROW_EVENTS_ABI = [
  {
    type: 'event', name: 'ReservationCreated',
    inputs: [
      { name: 'reservationId', type: 'uint256', indexed: true },
      { name: 'requester', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'duration', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event', name: 'PaymentReleased',
    inputs: [
      { name: 'reservationId', type: 'uint256', indexed: true },
      { name: 'grossAmount', type: 'uint256', indexed: false },
      { name: 'netToProviders', type: 'uint256', indexed: false },
      { name: 'protocolFee', type: 'uint256', indexed: false },
      { name: 'burnedAmount', type: 'uint256', indexed: false },
      { name: 'treasuryAmount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event', name: 'Refunded',
    inputs: [
      { name: 'reservationId', type: 'uint256', indexed: true },
      { name: 'requester', type: 'address', indexed: true },
      { name: 'refundAmount', type: 'uint256', indexed: false },
    ],
  },
] as const

export const STAKING_EVENTS_ABI = [
  {
    type: 'event', name: 'Staked',
    inputs: [
      { name: 'provider', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'totalStake', type: 'uint256', indexed: false },
      { name: 'tier', type: 'uint8', indexed: false },
    ],
  },
  {
    type: 'event', name: 'UnstakeRequested',
    inputs: [
      { name: 'provider', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'unlockTime', type: 'uint256', indexed: false },
      { name: 'requestIndex', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event', name: 'UnstakeCompleted',
    inputs: [
      { name: 'provider', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'requestIndex', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event', name: 'RewardClaimed',
    inputs: [
      { name: 'provider', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event', name: 'Slashed',
    inputs: [
      { name: 'provider', type: 'address', indexed: true },
      { name: 'totalSlashed', type: 'uint256', indexed: false },
      { name: 'burnedAmount', type: 'uint256', indexed: false },
      { name: 'treasuryAmount', type: 'uint256', indexed: false },
    ],
  },
] as const

export const BUNKER_REGISTRY_ABI = [
  { name: 'register', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'name', type: 'string' }, { name: 'deploymentID', type: 'bytes32' }], outputs: [] },
  { name: 'renew', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'name', type: 'string' }], outputs: [] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'name', type: 'string' }, { name: 'newOwner', type: 'address' }], outputs: [] },
  { name: 'updateDeployment', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'name', type: 'string' }, { name: 'newDeploymentID', type: 'bytes32' }], outputs: [] },
  { name: 'release', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'name', type: 'string' }], outputs: [] },
  { name: 'setMetadata', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'name', type: 'string' }, { name: 'description', type: 'string' }, { name: 'avatarURL', type: 'string' }], outputs: [] },
  { name: 'resolve', type: 'function', stateMutability: 'view', inputs: [{ name: 'name', type: 'string' }], outputs: [{ name: 'owner', type: 'address' }, { name: 'deploymentID', type: 'bytes32' }, { name: 'registeredAt', type: 'uint256' }] },
  { name: 'isAvailable', type: 'function', stateMutability: 'view', inputs: [{ name: 'name', type: 'string' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'calculatePrice', type: 'function', stateMutability: 'view', inputs: [{ name: 'name', type: 'string' }, { name: 'user', type: 'address' }], outputs: [{ name: 'price', type: 'uint256' }] },
  { name: 'nameCount', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'ownedNameAt', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }], outputs: [{ name: '', type: 'bytes32' }] },
  { name: 'subdomains', type: 'function', stateMutability: 'view', inputs: [{ name: 'nameHash', type: 'bytes32' }], outputs: [{ name: 'owner', type: 'address' }, { name: 'deploymentID', type: 'bytes32' }, { name: 'registeredAt', type: 'uint48' }, { name: 'expiresAt', type: 'uint48' }, { name: 'reservedUntil', type: 'uint48' }, { name: 'referrer', type: 'address' }] },
  { name: 'metadata', type: 'function', stateMutability: 'view', inputs: [{ name: 'nameHash', type: 'bytes32' }], outputs: [{ name: 'description', type: 'string' }, { name: 'avatarURL', type: 'string' }] },
  { name: 'registrationFee', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'changeFee', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'expirationPeriod', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'nameOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'nameHash', type: 'bytes32' }], outputs: [{ name: '', type: 'string' }] },
] as const

// ── Contract name type & addresses ───────────────────────────────────────────

export type ContractName = 'token' | 'staking' | 'escrow' | 'pricing' | 'timelock' | 'delegation' | 'reputation' | 'verification' | 'registry'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

/** True when an address is the canonical zero address (case-insensitive). */
export function isZeroAddress(addr: string | undefined | null): boolean {
  return !addr || addr.toLowerCase() === ZERO_ADDRESS
}

type ContractAddresses = Record<ContractName, `0x${string}`>

// ── Address manifest (ADDR-01 canonical shape) ───────────────────────────────
// Single source of truth lives in `web/addresses.json`, keyed by chainId string.
// It is statically imported at build time (public on-chain facts, never secret).

interface AddressManifestChain {
  chainName: string
  rpcUrl: string
  contracts: Record<string, string>
  deployedAt?: string
  note?: string
}

interface AddressManifest {
  chains: Record<string, AddressManifestChain>
}

import manifest from '../../addresses.json'

const CONTRACT_NAMES: ContractName[] = [
  'token', 'staking', 'escrow', 'pricing', 'timelock', 'delegation', 'reputation', 'verification', 'registry',
]

function buildChain(chainId: number): ContractAddresses {
  const entry = (manifest as AddressManifest).chains[String(chainId)]
  const result = {} as ContractAddresses
  for (const name of CONTRACT_NAMES) {
    const addr = entry?.contracts?.[name]
    result[name] = (addr && /^0x[0-9a-fA-F]{40}$/.test(addr) ? addr : ZERO_ADDRESS) as `0x${string}`
  }
  return result
}

export const CONTRACTS: Record<number, ContractAddresses> = {
  [CHAIN_IDS.BASE_MAINNET]: buildChain(CHAIN_IDS.BASE_MAINNET),
  [CHAIN_IDS.BASE_SEPOLIA]: buildChain(CHAIN_IDS.BASE_SEPOLIA),
  [CHAIN_IDS.LOCAL]: buildChain(CHAIN_IDS.LOCAL),
}
