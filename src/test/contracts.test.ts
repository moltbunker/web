import { describe, it, expect } from 'vitest'
import { CONTRACTS, CHAIN_IDS, isZeroAddress, ZERO_ADDRESS } from '@/lib/contracts'

describe('contract address manifest', () => {
  it('resolves Sepolia addresses from the manifest', () => {
    expect(CONTRACTS[CHAIN_IDS.BASE_SEPOLIA].token).toBe('0x4cc3F5C0d2Ecb4118e214980906eFe5c880a6ceA')
    expect(CONTRACTS[CHAIN_IDS.BASE_SEPOLIA].registry).toBe('0x3559A7D2E6F09eA74a295e654e0D6C22F921D4b5')
  })

  it('leaves mainnet addresses zeroed until cutover', () => {
    expect(CONTRACTS[CHAIN_IDS.BASE_MAINNET].token).toBe(ZERO_ADDRESS)
    expect(isZeroAddress(CONTRACTS[CHAIN_IDS.BASE_MAINNET].token)).toBe(true)
  })

  it('resolves local anvil addresses from the manifest', () => {
    expect(CONTRACTS[CHAIN_IDS.LOCAL].token).toBe('0x5FbDB2315678afecb367f032d93F642f64180aa3')
  })
})

describe('isZeroAddress', () => {
  it('returns true for the canonical zero address', () => {
    expect(isZeroAddress('0x0000000000000000000000000000000000000000')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isZeroAddress('0x0000000000000000000000000000000000000000'.toUpperCase())).toBe(true)
  })

  it('returns true for undefined / empty', () => {
    expect(isZeroAddress(undefined)).toBe(true)
    expect(isZeroAddress('')).toBe(true)
  })

  it('returns false for a real address', () => {
    expect(isZeroAddress('0x4cc3F5C0d2Ecb4118e214980906eFe5c880a6ceA')).toBe(false)
  })
})
