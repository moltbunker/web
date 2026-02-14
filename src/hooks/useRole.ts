import { useMemo } from 'react'
import { useStakeInfo } from '@/hooks/useContracts'
import { formatUnits } from 'viem'

export type Role = 'requester' | 'provider'

/**
 * Derive user role from on-chain stake.
 * stake > 0 → provider (providers can also deploy, so they're both roles).
 * stake === 0 → requester (also the default while loading).
 */
export function useRole(): Role {
  const { stake } = useStakeInfo()

  return useMemo(() => {
    if (!stake.data) return 'requester'
    const amount = Number(formatUnits(stake.data as bigint, 18))
    return amount > 0 ? 'provider' : 'requester'
  }, [stake.data])
}
