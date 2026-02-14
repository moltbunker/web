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

// ── Contract name type & addresses ───────────────────────────────────────────

export type ContractName = 'token' | 'staking' | 'escrow' | 'pricing' | 'timelock' | 'delegation' | 'reputation' | 'verification'

const ZERO = '0x0000000000000000000000000000000000000000' as const

type ContractAddresses = Record<ContractName, `0x${string}`>

export const CONTRACTS: Record<number, ContractAddresses> = {
  [CHAIN_IDS.BASE_MAINNET]: {
    token: ZERO, staking: ZERO, escrow: ZERO, pricing: ZERO,
    timelock: ZERO, delegation: ZERO, reputation: ZERO, verification: ZERO,
  },
  [CHAIN_IDS.BASE_SEPOLIA]: {
    token: '0x4cc3F5C0d2Ecb4118e214980906eFe5c880a6ceA',
    staking: '0xDC76d972a827D2a19867EF9aBD335014d5Cf7D6a',
    escrow: '0xBAdaB53a9E98D904E3dfcDb728D510c69DAeE9B4',
    pricing: '0x5A61b05F289344202433ccDf44aFc611d9E3dA47',
    timelock: '0xcD8af28808749CD4B55a970f14DA250C8EAEd3C9',
    delegation: '0x071252B4f4bC80cccEccDe1A644229EE2dAf09F5',
    reputation: '0x55721fC66B30Fe26a0820CfDeffC0815135678Ed',
    verification: '0x9aA9Fc961da51dcFfF0232883631f7147CaBFBCD',
  },
  [CHAIN_IDS.LOCAL]: {
    token: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    staking: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    escrow: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    pricing: ZERO, timelock: ZERO, delegation: ZERO, reputation: ZERO, verification: ZERO,
  },
}
