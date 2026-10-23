import { useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Abi } from 'viem'
import { CONTRACTS, BUNKER_TOKEN_ABI, BUNKER_STAKING_ABI, BUNKER_REGISTRY_ABI, isZeroAddress } from '@/lib/contracts'
import type { ContractName } from '@/lib/contracts'

/** Resolve a contract address for the connected chain. */
export function useContractAddress(contract: ContractName): `0x${string}` | undefined {
  const { chain } = useAccount()
  if (!chain) return undefined
  const addrs = CONTRACTS[chain.id]
  if (!addrs) return undefined
  const addr = addrs[contract]
  if (isZeroAddress(addr)) return undefined
  return addr
}

/**
 * True when the active chain has at least one non-zero contract address.
 * Used to surface a "contracts not configured" banner instead of silently
 * no-oping every on-chain read/write (e.g. on Base Mainnet before cutover).
 */
export function useAddressesReady(): boolean {
  const { chain } = useAccount()
  if (!chain) return false
  const addrs = CONTRACTS[chain.id]
  if (!addrs) return false
  return Object.values(addrs).some((addr) => !isZeroAddress(addr))
}

/** Read a single view function, auto-refreshing every 60s. */
export function useContractField(contract: ContractName, abi: Abi, functionName: string) {
  const address = useContractAddress(contract)
  return useReadContract({
    address,
    abi,
    functionName,
    query: { enabled: !!address, refetchInterval: 60_000 },
  })
}

/**
 * Full write lifecycle: send TX -> wait for receipt.
 * idle -> pending (wallet confirm) -> confirming (on-chain) -> success/error
 */
export function useContractWrite() {
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract()

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash })

  // Auto-reset after 4s on success
  useEffect(() => {
    if (isSuccess) {
      const t = setTimeout(reset, 4000)
      return () => clearTimeout(t)
    }
  }, [isSuccess, reset])

  return {
    writeContract,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    receipt,
    reset,
  }
}

/** Read BUNKER token balance directly from the contract. */
export function useBunkerBalance() {
  const { address, chain } = useAccount()
  const tokenAddress = chain ? CONTRACTS[chain.id]?.token : undefined
  const enabled = !!address && !!tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000'
  return useReadContract({
    address: tokenAddress,
    abi: BUNKER_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled, refetchInterval: 60_000 },
  })
}

/** Read staking info (amount + tier) directly from the contract. */
export function useStakeInfo() {
  const { address, chain } = useAccount()
  const stakingAddress = chain ? CONTRACTS[chain.id]?.staking : undefined
  const enabled = !!address && !!stakingAddress && stakingAddress !== '0x0000000000000000000000000000000000000000'

  const stake = useReadContract({
    address: stakingAddress,
    abi: BUNKER_STAKING_ABI,
    functionName: 'getStake',
    args: address ? [address] : undefined,
    query: { enabled, refetchInterval: 120_000 },
  })

  const tier = useReadContract({
    address: stakingAddress,
    abi: BUNKER_STAKING_ABI,
    functionName: 'getTier',
    args: address ? [address] : undefined,
    query: { enabled, refetchInterval: 120_000 },
  })

  return { stake, tier }
}

/** Read token allowance for a given spender. */
export function useTokenAllowance(spender: `0x${string}` | undefined) {
  const { address, chain } = useAccount()
  const tokenAddress = chain ? CONTRACTS[chain.id]?.token : undefined
  const enabled = !!address && !!tokenAddress && !!spender && tokenAddress !== '0x0000000000000000000000000000000000000000'
  return useReadContract({
    address: tokenAddress,
    abi: BUNKER_TOKEN_ABI,
    functionName: 'allowance',
    args: address && spender ? [address, spender] : undefined,
    query: { enabled, refetchInterval: 30_000 },
  })
}

// ─── Registry Hooks ─────────────────────────────────────────────────────────

export function useNameAvailable(name: string) {
  const address = useContractAddress('registry')
  return useReadContract({
    address,
    abi: BUNKER_REGISTRY_ABI,
    functionName: 'isAvailable',
    args: [name],
    query: { enabled: !!address && name.length >= 3 },
  })
}

export function useNamePrice(name: string) {
  const { address: userAddress } = useAccount()
  const registryAddress = useContractAddress('registry')
  return useReadContract({
    address: registryAddress,
    abi: BUNKER_REGISTRY_ABI,
    functionName: 'calculatePrice',
    args: userAddress ? [name, userAddress] : undefined,
    query: { enabled: !!registryAddress && !!userAddress && name.length >= 3 },
  })
}

export function useNameCount() {
  const { address } = useAccount()
  const registryAddress = useContractAddress('registry')
  return useReadContract({
    address: registryAddress,
    abi: BUNKER_REGISTRY_ABI,
    functionName: 'nameCount',
    args: address ? [address] : undefined,
    query: { enabled: !!registryAddress && !!address, refetchInterval: 60_000 },
  })
}

export function useOwnedNameAt(index: number) {
  const { address } = useAccount()
  const registryAddress = useContractAddress('registry')
  return useReadContract({
    address: registryAddress,
    abi: BUNKER_REGISTRY_ABI,
    functionName: 'ownedNameAt',
    args: address ? [address, BigInt(index)] : undefined,
    query: { enabled: !!registryAddress && !!address && index >= 0, refetchInterval: 60_000 },
  })
}

export function useSubdomainRecord(nameHash: `0x${string}` | undefined) {
  const registryAddress = useContractAddress('registry')
  return useReadContract({
    address: registryAddress,
    abi: BUNKER_REGISTRY_ABI,
    functionName: 'subdomains',
    args: nameHash ? [nameHash] : undefined,
    query: { enabled: !!registryAddress && !!nameHash, refetchInterval: 60_000 },
  })
}

export function useNameMetadata(nameHash: `0x${string}` | undefined) {
  const registryAddress = useContractAddress('registry')
  return useReadContract({
    address: registryAddress,
    abi: BUNKER_REGISTRY_ABI,
    functionName: 'metadata',
    args: nameHash ? [nameHash] : undefined,
    query: { enabled: !!registryAddress && !!nameHash },
  })
}

export function useNameOf(nameHash: `0x${string}` | undefined) {
  const registryAddress = useContractAddress('registry')
  return useReadContract({
    address: registryAddress,
    abi: BUNKER_REGISTRY_ABI,
    functionName: 'nameOf',
    args: nameHash ? [nameHash] : undefined,
    query: { enabled: !!registryAddress && !!nameHash },
  })
}

export function useRegistrationFee() {
  const registryAddress = useContractAddress('registry')
  return useReadContract({
    address: registryAddress,
    abi: BUNKER_REGISTRY_ABI,
    functionName: 'registrationFee',
    query: { enabled: !!registryAddress, refetchInterval: 120_000 },
  })
}

/** BaseScan URL for a TX hash. */
export function useTxUrl(hash: `0x${string}` | undefined) {
  const { chain } = useAccount()
  if (!hash || !chain) return undefined
  if (chain.id === 8453) return `https://basescan.org/tx/${hash}`
  if (chain.id === 84532) return `https://sepolia.basescan.org/tx/${hash}`
  return undefined
}
