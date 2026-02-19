import { useEffect, useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { formatUnits, type PublicClient } from 'viem'
import {
  CONTRACTS,
  TOKEN_TRANSFER_EVENT,
  ESCROW_EVENTS_ABI,
  STAKING_EVENTS_ABI,
} from '@/lib/contracts'

export type TxKind =
  | 'transfer_in'
  | 'transfer_out'
  | 'escrow_created'
  | 'payment_released'
  | 'refund'
  | 'staked'
  | 'unstake_requested'
  | 'unstake_completed'
  | 'reward_claimed'
  | 'slashed'

export interface TxHistoryItem {
  kind: TxKind
  label: string
  amount: number
  txHash: `0x${string}`
  blockNumber: bigint
  timestamp?: number
}

const KIND_LABELS: Record<TxKind, string> = {
  transfer_in: 'Received',
  transfer_out: 'Sent',
  escrow_created: 'Escrow Created',
  payment_released: 'Payment Released',
  refund: 'Refund',
  staked: 'Staked',
  unstake_requested: 'Unstake Requested',
  unstake_completed: 'Unstake Completed',
  reward_claimed: 'Reward Claimed',
  slashed: 'Slashed',
}

// Base Sepolia public RPC limits eth_getLogs to 10,000 blocks per request.
// We paginate in chunks and scan back ~100k blocks (~2.3 days at 2s/block).
const CHUNK_SIZE = 9_900n
const MAX_RANGE = 100_000n

/** Paginated getLogs that respects RPC block range limits. */
async function getLogsPaginated(
  client: PublicClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>,
  from: bigint,
  to: bigint,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all: any[] = []
  let cursor = from
  while (cursor <= to) {
    const end = cursor + CHUNK_SIZE > to ? to : cursor + CHUNK_SIZE
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logs = await (client as any).getLogs({ ...params, fromBlock: cursor, toBlock: end })
    all.push(...logs)
    cursor = end + 1n
  }
  return all
}

/** Fetch on-chain transaction history for the connected wallet. */
export function useTransactionHistory() {
  const { address, chain } = useAccount()
  const client = usePublicClient()
  const [items, setItems] = useState<TxHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address || !chain || !client) {
      setItems([])
      return
    }

    const addrs = CONTRACTS[chain.id]
    if (!addrs) {
      setItems([])
      return
    }

    let cancelled = false
    const ZERO = '0x0000000000000000000000000000000000000000'

    async function fetchHistory() {
      setLoading(true)
      setError(null)

      try {
        const results: TxHistoryItem[] = []

        const latest = await client!.getBlockNumber()
        const fromBlock = latest > MAX_RANGE ? latest - MAX_RANGE : 0n

        // 1. Token transfers (sent + received)
        if (addrs!.token !== ZERO) {
          const [sent, received] = await Promise.all([
            getLogsPaginated(client!, {
              address: addrs!.token,
              event: TOKEN_TRANSFER_EVENT,
              args: { from: address },
            }, fromBlock, latest),
            getLogsPaginated(client!, {
              address: addrs!.token,
              event: TOKEN_TRANSFER_EVENT,
              args: { to: address },
            }, fromBlock, latest),
          ])

          const contractAddrs = new Set(
            Object.values(addrs!).map(a => a.toLowerCase())
          )

          for (const log of sent) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const args = (log as any).args
            if (!args) continue
            const to = (args.to as string).toLowerCase()
            if (contractAddrs.has(to)) continue
            results.push({
              kind: 'transfer_out',
              label: KIND_LABELS.transfer_out,
              amount: Math.round(Number(formatUnits(args.value as bigint, 18))),
              txHash: log.transactionHash!,
              blockNumber: log.blockNumber!,
            })
          }

          for (const log of received) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const args = (log as any).args
            if (!args) continue
            const from = (args.from as string).toLowerCase()
            if (contractAddrs.has(from)) continue
            results.push({
              kind: 'transfer_in',
              label: KIND_LABELS.transfer_in,
              amount: Math.round(Number(formatUnits(args.value as bigint, 18))),
              txHash: log.transactionHash!,
              blockNumber: log.blockNumber!,
            })
          }
        }

        // 2. Escrow events
        if (addrs!.escrow !== ZERO) {
          const escrowLogs = await getLogsPaginated(client!, {
            address: addrs!.escrow,
            events: ESCROW_EVENTS_ABI,
          }, fromBlock, latest)

          for (const log of escrowLogs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const args = (log as any).args
            if (!args) continue
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const name = (log as any).eventName as string

            if (name === 'ReservationCreated' && args.requester?.toLowerCase() === address!.toLowerCase()) {
              results.push({
                kind: 'escrow_created',
                label: KIND_LABELS.escrow_created,
                amount: Math.round(Number(formatUnits(args.amount as bigint, 18))),
                txHash: log.transactionHash!,
                blockNumber: log.blockNumber!,
              })
            } else if (name === 'PaymentReleased') {
              results.push({
                kind: 'payment_released',
                label: KIND_LABELS.payment_released,
                amount: Math.round(Number(formatUnits(args.grossAmount as bigint, 18))),
                txHash: log.transactionHash!,
                blockNumber: log.blockNumber!,
              })
            } else if (name === 'Refunded' && args.requester?.toLowerCase() === address!.toLowerCase()) {
              results.push({
                kind: 'refund',
                label: KIND_LABELS.refund,
                amount: Math.round(Number(formatUnits(args.refundAmount as bigint, 18))),
                txHash: log.transactionHash!,
                blockNumber: log.blockNumber!,
              })
            }
          }
        }

        // 3. Staking events (filter by provider client-side)
        if (addrs!.staking !== ZERO) {
          const stakingLogs = await getLogsPaginated(client!, {
            address: addrs!.staking,
            events: STAKING_EVENTS_ABI,
          }, fromBlock, latest)

          for (const log of stakingLogs) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const args = (log as any).args
            if (!args) continue
            if (args.provider?.toLowerCase() !== address!.toLowerCase()) continue
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const name = (log as any).eventName as string

            let kind: TxKind | null = null
            let amount = 0n

            if (name === 'Staked') {
              kind = 'staked'
              amount = args.amount as bigint
            } else if (name === 'UnstakeRequested') {
              kind = 'unstake_requested'
              amount = args.amount as bigint
            } else if (name === 'UnstakeCompleted') {
              kind = 'unstake_completed'
              amount = args.amount as bigint
            } else if (name === 'RewardClaimed') {
              kind = 'reward_claimed'
              amount = args.amount as bigint
            } else if (name === 'Slashed') {
              kind = 'slashed'
              amount = args.totalSlashed as bigint
            }

            if (kind) {
              results.push({
                kind,
                label: KIND_LABELS[kind],
                amount: Math.round(Number(formatUnits(amount, 18))),
                txHash: log.transactionHash!,
                blockNumber: log.blockNumber!,
              })
            }
          }
        }

        if (cancelled) return

        // Sort by block number descending (newest first)
        results.sort((a, b) => Number(b.blockNumber - a.blockNumber))

        // Resolve timestamps for the most recent 50
        const toResolve = results.slice(0, 50)
        const uniqueBlocks = [...new Set(toResolve.map(r => r.blockNumber))]
        const blockMap = new Map<bigint, number>()

        const blockPromises = uniqueBlocks.map(async (bn) => {
          try {
            const block = await client!.getBlock({ blockNumber: bn })
            blockMap.set(bn, Number(block.timestamp))
          } catch {
            // timestamp stays undefined
          }
        })
        await Promise.all(blockPromises)

        for (const item of toResolve) {
          item.timestamp = blockMap.get(item.blockNumber)
        }

        if (!cancelled) {
          setItems(results)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch transaction history')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchHistory()
    return () => { cancelled = true }
  }, [address, chain, client])

  return { items, loading, error }
}
