export const CHAIN_IDS = {
  BASE_MAINNET: 8453,
  BASE_SEPOLIA: 84532,
  LOCAL: 31337,
} as const

// ABI fragments — only the functions we call from the frontend
export const BUNKER_TOKEN_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export const BUNKER_STAKING_ABI = [
  {
    name: 'getStake',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'provider', type: 'address' }],
    outputs: [{ name: 'amount', type: 'uint256' }],
  },
  {
    name: 'getTier',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'provider', type: 'address' }],
    outputs: [{ name: 'tier', type: 'uint8' }],
  },
  {
    name: 'stake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const

export const BUNKER_ESCROW_ABI = [
  {
    name: 'getReservation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'reservationId', type: 'bytes32' }],
    outputs: [
      { name: 'requester', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'released', type: 'bool' },
    ],
  },
] as const

// Contract addresses per chain — update after deployment
export const CONTRACTS: Record<number, {
  token: `0x${string}`
  staking: `0x${string}`
  escrow: `0x${string}`
}> = {
  [CHAIN_IDS.BASE_MAINNET]: {
    token: '0x0000000000000000000000000000000000000000',
    staking: '0x0000000000000000000000000000000000000000',
    escrow: '0x0000000000000000000000000000000000000000',
  },
  [CHAIN_IDS.BASE_SEPOLIA]: {
    token: '0x0000000000000000000000000000000000000000',
    staking: '0x0000000000000000000000000000000000000000',
    escrow: '0x0000000000000000000000000000000000000000',
  },
  [CHAIN_IDS.LOCAL]: {
    token: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    staking: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    escrow: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
}
