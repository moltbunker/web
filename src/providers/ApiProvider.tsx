import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { ApiClient } from '@/lib/api'
import { AuthManager, type AuthState } from '@/lib/auth'
import { ApiContext, type ApiContextValue } from '@/hooks/useApi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export default function ApiProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => new ApiClient(API_BASE_URL), [])
  const authManager = useRef(new AuthManager(client))

  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    address: null,
    expiresAt: 0,
  })

  // Listen for auth state changes and 401 responses
  useEffect(() => {
    authManager.current.setOnStateChange(setAuth)
    client.onUnauthorized = () => authManager.current.logout()
    return () => {
      authManager.current.destroy()
      client.onUnauthorized = null
    }
  }, [client])

  // Logout when wallet disconnects
  useEffect(() => {
    if (!isConnected && auth.isAuthenticated) {
      authManager.current.logout()
    }
  }, [isConnected, auth.isAuthenticated])

  const authenticate = useCallback(async () => {
    if (!address) return
    await authManager.current.authenticate(address, signMessageAsync)
  }, [address, signMessageAsync])

  const logout = useCallback(() => {
    authManager.current.logout()
  }, [])

  const value = useMemo<ApiContextValue>(
    () => ({ client, auth, authenticate, logout }),
    [client, auth, authenticate, logout],
  )

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}
