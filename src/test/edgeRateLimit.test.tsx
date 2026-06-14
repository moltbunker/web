import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiContext } from '@/hooks/useApi'
import type { ApiContextValue } from '@/hooks/useApi'
import type { ApiClient, RateLimitConfig } from '@/lib/api'
import EdgeRateLimit from '@/pages/app/EdgeRateLimit'

// Per-container server config, so a container switch must surface different rpm.
const SERVER: Record<string, RateLimitConfig> = {
  'container-x': { container_id: 'container-x', requests_per_minute: 60, burst: 10, by: 'ip' },
  'container-y': { container_id: 'container-y', requests_per_minute: 999, burst: 5, by: 'header' },
}

function makeClient(): ApiClient {
  return {
    getRateLimitConfig: async (id: string) => {
      const cfg = SERVER[id]
      if (!cfg) throw new Error('not found')
      return cfg
    },
    setRateLimitConfig: async (cfg: RateLimitConfig) => cfg,
  } as unknown as ApiClient
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const ctx: ApiContextValue = {
    client: makeClient(),
    auth: { isAuthenticated: true, address: '0xabc', expiresAt: Date.now() + 60_000 },
    authenticate: async () => {},
    logout: () => {},
  }
  return render(
    <MemoryRouter initialEntries={['/app/edge/rate-limit?container=container-x']}>
      <QueryClientProvider client={qc}>
        <ApiContext.Provider value={ctx}>
          <EdgeRateLimit />
        </ApiContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('EdgeRateLimit draft reset on container switch', () => {
  it('discards the edited draft when the container id changes', async () => {
    renderPage()

    // Wait for container-x's server config (rpm 60) to render.
    const rpm = await screen.findByLabelText('Requests per minute')
    await waitFor(() => expect((rpm as HTMLInputElement).value).toBe('60'))

    // User edits the RPM for container-x -> draft becomes sticky (777).
    fireEvent.change(rpm, { target: { value: '777' } })
    expect((rpm as HTMLInputElement).value).toBe('777')

    // Switch the Container ID input to container-y.
    const idInput = screen.getByPlaceholderText('container-id')
    fireEvent.change(idInput, { target: { value: 'container-y' } })

    // The form must now reflect container-y's freshly-fetched server config
    // (rpm 999), NOT the stale 777 draft from container-x.
    await waitFor(() =>
      expect((screen.getByLabelText('Requests per minute') as HTMLInputElement).value).toBe('999'),
    )
  })
})
