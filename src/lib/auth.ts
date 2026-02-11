import type { ApiClient } from './api'

const REFRESH_BUFFER_MS = 5 * 60 * 1000 // refresh 5 min before expiry

export interface AuthState {
  isAuthenticated: boolean
  address: string | null
  expiresAt: number
}

export class AuthManager {
  private refreshTimer: ReturnType<typeof setTimeout> | null = null
  private onStateChange: ((state: AuthState) => void) | null = null
  private client: ApiClient

  constructor(client: ApiClient) {
    this.client = client
  }

  setOnStateChange(cb: (state: AuthState) => void) {
    this.onStateChange = cb
  }

  private emitState(address: string | null) {
    this.onStateChange?.({
      isAuthenticated: this.client.isAuthenticated,
      address,
      expiresAt: this.client.isAuthenticated ? Date.now() + this.client.tokenExpiresIn : 0,
    })
  }

  async authenticate(
    address: string,
    signMessage: (args: { message: string }) => Promise<string>,
  ): Promise<void> {
    // Step 1: Get challenge
    const { challenge } = await this.client.authChallenge(address)

    // Step 2: Sign with wallet
    const signature = await signMessage({ message: challenge })

    // Step 3: Verify and get token
    const { token, expires_at } = await this.client.authVerify({
      address,
      message: challenge,
      signature,
    })

    // Step 4: Store token
    this.client.setToken(token, expires_at)
    this.scheduleRefresh(address, signMessage)
    this.emitState(address)
  }

  private scheduleRefresh(
    address: string,
    signMessage: (args: { message: string }) => Promise<string>,
  ) {
    this.clearRefreshTimer()

    const delay = Math.max(0, this.client.tokenExpiresIn - REFRESH_BUFFER_MS)
    if (delay <= 0) return

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.authenticate(address, signMessage)
      } catch {
        // Silent fail — user will re-auth on next action
        this.logout()
      }
    }, delay)
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  logout() {
    this.clearRefreshTimer()
    this.client.clearToken()
    this.emitState(null)
  }

  destroy() {
    this.clearRefreshTimer()
    this.onStateChange = null
  }
}
