import { useState, useCallback, useRef } from 'react'
import { useSignMessage } from 'wagmi'
import { useApiClient } from '@/hooks/useApi'
import { deriveMasterKEK } from '@/lib/exec-crypto'

/** Exec auth state returned by the hook. */
export interface ExecAuthState {
  /** Whether the master KEK has been derived (user signed the exec message). */
  isReady: boolean
  /** Whether the auth flow is in progress. */
  isLoading: boolean
  /** Any error that occurred during auth. */
  error: string | null
}

/** Fixed message signed once per browser session to derive the master KEK. */
const MASTER_KEK_MESSAGE = 'moltbunker:exec-master:v1'

/**
 * useExecAuth manages the exec two-factor authentication flow:
 * 1. Derive master KEK from a fixed wallet signature (cached — one prompt per session)
 * 2. Request a single-use challenge nonce from the API
 * 3. User signs the challenge with their wallet (proves key ownership per exec)
 * 4. Return the challenge nonce + signature for WebSocket upgrade, plus the cached masterKEK
 */
export function useExecAuth() {
  const { client } = useApiClient()
  const { signMessageAsync } = useSignMessage()

  const [state, setState] = useState<ExecAuthState>({
    isReady: false,
    isLoading: false,
    error: null,
  })

  // Cache the master KEK so we only ask for the KEK signature once per session
  const masterKEKRef = useRef<CryptoKey | null>(null)

  /**
   * Authenticate for exec access to a container.
   * Returns { nonce, signature, masterKEK } on success.
   */
  const authenticate = useCallback(
    async (containerID: string) => {
      setState({ isReady: false, isLoading: true, error: null })

      try {
        // Step 1: Derive master KEK (cached — only signs once per browser session)
        let masterKEK = masterKEKRef.current
        if (!masterKEK) {
          const kekSignature = await signMessageAsync({
            message: MASTER_KEK_MESSAGE,
          })
          masterKEK = await deriveMasterKEK(kekSignature)
          masterKEKRef.current = masterKEK
        }

        // Step 2: Get per-exec challenge from API
        const { nonce, message } = await client.execChallenge(containerID)

        // Step 3: Sign the challenge with wallet (user sees popup — this is the per-exec auth)
        const signature = await signMessageAsync({ message })

        setState({ isReady: true, isLoading: false, error: null })

        return { nonce, signature, masterKEK }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Exec authentication failed'
        setState({ isReady: false, isLoading: false, error: errorMsg })
        throw err
      }
    },
    [client, signMessageAsync],
  )

  /** Get the cached master KEK (null if not yet authenticated). */
  const getMasterKEK = useCallback(() => masterKEKRef.current, [])

  /** Reset auth state (e.g., on disconnect). */
  const reset = useCallback(() => {
    masterKEKRef.current = null
    setState({ isReady: false, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    authenticate,
    getMasterKEK,
    reset,
  }
}
