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

/**
 * useExecAuth manages the exec two-factor authentication flow:
 * 1. Request a single-use challenge nonce from the API
 * 2. User signs with their wallet (proves key ownership)
 * 3. Derive master KEK from the signature (for E2E encryption)
 * 4. Return the nonce + signature for WebSocket upgrade
 */
export function useExecAuth() {
  const { client } = useApiClient()
  const { signMessageAsync } = useSignMessage()

  const [state, setState] = useState<ExecAuthState>({
    isReady: false,
    isLoading: false,
    error: null,
  })

  // Cache the master KEK so we don't ask the user to sign again
  const masterKEKRef = useRef<CryptoKey | null>(null)
  // Cache the last signature for session key derivation
  const lastSignatureRef = useRef<string | null>(null)

  /**
   * Authenticate for exec access to a container.
   * Returns { nonce, signature, masterKEK } on success.
   */
  const authenticate = useCallback(
    async (containerID: string) => {
      setState({ isReady: false, isLoading: true, error: null })

      try {
        // Step 1: Get challenge from API
        const { nonce, message } = await client.execChallenge(containerID)

        // Step 2: Sign with wallet (user sees popup)
        const signature = await signMessageAsync({ message })

        // Step 3: Derive master KEK from the deterministic signature
        const masterKEK = await deriveMasterKEK(signature)
        masterKEKRef.current = masterKEK
        lastSignatureRef.current = signature

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
    lastSignatureRef.current = null
    setState({ isReady: false, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    authenticate,
    getMasterKEK,
    reset,
  }
}
