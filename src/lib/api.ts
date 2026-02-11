// Typed API client for MoltBunker REST API (/v1/*)
// All types derived from api/openapi.yaml

// ─── Error ───────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StatusResponse {
  node_id: string
  role: string
  version: string
  uptime: string
  peer_count: number
  region: string
  tor_enabled: boolean
  onion_address?: string
  staking_tier: string
  staking_amount: string
  reputation_score: number
  active_containers: number
  resources: ResourceInfo
}

export interface ResourceInfo {
  cpu_total: number
  cpu_available: number
  memory_total_mb: number
  memory_available_mb: number
  storage_total_gb: number
  storage_available_gb: number
}

export interface ResourceLimits {
  cpu_cores: number
  memory_mb: number
  storage_gb: number
  bandwidth_mbps?: number
}

export interface ResourceRequest {
  cpu_cores?: number
  memory_mb?: number
  storage_gb?: number
}

export interface BalanceResponse {
  wallet_address: string
  bunker_balance: string
  eth_balance: string
  deposited: string
  reserved: string
  available: string
}

export interface ThreatResponse {
  score: number
  level: 'low' | 'medium' | 'high' | 'critical' | 'unknown'
  active_signals: SignalInfo[]
  recommendation: string
  timestamp: string
}

export interface SignalInfo {
  type: string
  score: number
  confidence: number
  source: string
}

// Deploy
export interface DeployRequest {
  image: string
  tier?: 'minimal' | 'standard' | 'performance' | 'enterprise'
  duration_hours?: number
  region?: string
  resources?: ResourceLimits
  tor_only?: boolean
  onion_service?: boolean
}

export interface DeployResponse {
  container_id: string
  status: ContainerStatus
  onion_address?: string
  regions: string[]
  replica_count: number
  created_at: string
}

// Reserve
export interface ReserveRequest {
  tier?: 'minimal' | 'standard' | 'performance' | 'enterprise'
  duration_hours?: number
  region?: string
  tor_only?: boolean
}

export interface ReserveResponse {
  runtime_id: string
  status: string
  tier: string
  region: string
  expires_at: string
  onion_address?: string
  cost: string
}

// Containers
export type ContainerStatus = 'pending' | 'created' | 'deploying' | 'running' | 'paused' | 'stopped' | 'failed' | 'replicating'

export interface ContainerInfo {
  id: string
  image: string
  status: ContainerStatus
  created_at: string
  started_at?: string
  encrypted: boolean
  onion_address?: string
  regions: string[]
}

// Deployments
export interface DeploymentResponse {
  id: string
  bot_id: string
  runtime_id: string
  container_id: string
  status: 'starting' | 'running' | 'stopped' | 'failed' | 'error'
  region: string
  node_id: string
  onion_address?: string
  created_at: string
  started_at?: string
}

// Bots
export interface BotRequest {
  name: string
  image: string
  description?: string
  resources?: ResourceRequest
  region?: string
  metadata?: Record<string, string>
}

export interface BotResponse {
  id: string
  name: string
  image: string
  description?: string
  resources?: ResourceRequest
  region: string
  metadata?: Record<string, string>
  created_at: string
}

export interface BotStatusResponse {
  status: 'running' | 'stopped' | 'error' | 'deploying'
  uptime: string
  clones: number
  active_deployments: number
  threat_level: number
}

// Snapshots
export interface SnapshotRequest {
  container_id: string
  type?: 'full' | 'incremental' | 'checkpoint'
  metadata?: Record<string, string>
}

export interface SnapshotResponse {
  snapshot_id: string
  container_id: string
  type: 'full' | 'incremental' | 'checkpoint'
  size: number
  checksum: string
  created_at: string
}

export interface RestoreRequest {
  snapshot_id: string
  target_region?: string
  new_container?: boolean
}

export interface RestoreResponse {
  container_id: string
  snapshot_id: string
  status: 'restoring' | 'completed' | 'failed'
  restored_at: string
}

// Clones
export interface CloneRequest {
  code_hash?: string
  state_snapshot?: string
  target_region?: string
  reason?: string
}

export interface CloneResponse {
  clone_id: string
  source_id?: string
  target_id?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  target_region: string
  created_at: string
}

// Auth
export interface AuthChallengeResponse {
  challenge: string
  expires_at: string
}

export interface AuthVerifyRequest {
  address: string
  message: string
  signature: string
}

export interface AuthVerifyResponse {
  token: string
  expires_at: string
  address: string
}

// API Keys
export interface ApiKeyRequest {
  name: string
}

export interface ApiKeyResponse {
  id: string
  key: string
  name: string
  prefix: string
  created_at: string
}

export interface ApiKeyListItem {
  id: string
  name: string
  prefix: string
  created_at: string
  last_used_at?: string
}

// Health
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  uptime: string
  peer_count: number
  version: string
  reason?: string
}

// Logs
export interface LogEntry {
  timestamp: string
  level: string
  message: string
}

// ─── Client ──────────────────────────────────────────────────────────────────

export class ApiClient {
  private token: string | null = null
  private tokenExpiresAt: number = 0
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  // ── Token management ─────────────────────────

  setToken(token: string, expiresAt: string) {
    this.token = token
    this.tokenExpiresAt = new Date(expiresAt).getTime()
  }

  clearToken() {
    this.token = null
    this.tokenExpiresAt = 0
  }

  get isAuthenticated(): boolean {
    return !!this.token && Date.now() < this.tokenExpiresAt
  }

  get tokenExpiresIn(): number {
    return Math.max(0, this.tokenExpiresAt - Date.now())
  }

  // ── Request helper ───────────────────────────

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      let errorBody: { error?: string; message?: string } = {}
      try {
        errorBody = await res.json()
      } catch {
        // non-JSON error response
      }
      throw new ApiError(
        res.status,
        res.statusText,
        errorBody.error || errorBody.message || `API error ${res.status}`,
      )
    }

    if (res.status === 204) return undefined as T

    return res.json()
  }

  // ── Auth ──────────────────────────────────────

  authChallenge(address: string) {
    return this.request<AuthChallengeResponse>('POST', '/v1/auth/challenge', { address })
  }

  authVerify(req: AuthVerifyRequest) {
    return this.request<AuthVerifyResponse>('POST', '/v1/auth/verify', req)
  }

  // ── Status ────────────────────────────────────

  getStatus() {
    return this.request<StatusResponse>('GET', '/v1/status')
  }

  getBalance() {
    return this.request<BalanceResponse>('GET', '/v1/balance')
  }

  getThreat() {
    return this.request<ThreatResponse>('GET', '/v1/threat')
  }

  getHealth() {
    return this.request<HealthCheckResponse>('GET', '/v1/health')
  }

  // ── Deploy ────────────────────────────────────

  deploy(req: DeployRequest) {
    return this.request<DeployResponse>('POST', '/v1/deploy', req)
  }

  reserve(req: ReserveRequest) {
    return this.request<ReserveResponse>('POST', '/v1/reserve', req)
  }

  // ── Containers ────────────────────────────────

  listContainers() {
    return this.request<ContainerInfo[]>('GET', '/v1/containers')
  }

  getContainer(id: string) {
    return this.request<ContainerInfo>('GET', `/v1/containers/${id}`)
  }

  stopContainer(id: string) {
    return this.request<void>('POST', `/v1/containers/${id}/stop`)
  }

  deleteContainer(id: string) {
    return this.request<void>('DELETE', `/v1/containers/${id}`)
  }

  getContainerLogs(id: string, tail?: number) {
    const query = tail ? `?tail=${tail}` : ''
    return this.request<LogEntry[]>('GET', `/v1/containers/${id}/logs${query}`)
  }

  // ── Deployments ───────────────────────────────

  listDeployments() {
    return this.request<DeploymentResponse[]>('GET', '/v1/deployments')
  }

  getDeployment(id: string) {
    return this.request<DeploymentResponse>('GET', `/v1/deployments/${id}`)
  }

  stopDeployment(id: string) {
    return this.request<void>('POST', `/v1/deployments/${id}/stop`)
  }

  // ── Bots ──────────────────────────────────────

  listBots() {
    return this.request<BotResponse[]>('GET', '/v1/bots')
  }

  createBot(req: BotRequest) {
    return this.request<BotResponse>('POST', '/v1/bots', req)
  }

  getBot(id: string) {
    return this.request<BotResponse>('GET', `/v1/bots/${id}`)
  }

  getBotStatus(id: string) {
    return this.request<BotStatusResponse>('GET', `/v1/bots/${id}/status`)
  }

  deleteBot(id: string) {
    return this.request<void>('DELETE', `/v1/bots/${id}`)
  }

  // ── Snapshots ─────────────────────────────────

  createSnapshot(req: SnapshotRequest) {
    return this.request<SnapshotResponse>('POST', '/v1/snapshots', req)
  }

  listSnapshots() {
    return this.request<SnapshotResponse[]>('GET', '/v1/snapshots')
  }

  deleteSnapshot(id: string) {
    return this.request<void>('DELETE', `/v1/snapshots/${id}`)
  }

  restoreSnapshot(id: string, req: RestoreRequest) {
    return this.request<RestoreResponse>('POST', `/v1/snapshots/${id}/restore`, req)
  }

  // ── Clones ────────────────────────────────────

  clone(req: CloneRequest) {
    return this.request<CloneResponse>('POST', '/v1/clone', req)
  }

  listClones() {
    return this.request<CloneResponse[]>('GET', '/v1/clones')
  }

  // ── API Keys ──────────────────────────────────

  listApiKeys() {
    return this.request<ApiKeyListItem[]>('GET', '/v1/api-keys')
  }

  createApiKey(req: ApiKeyRequest) {
    return this.request<ApiKeyResponse>('POST', '/v1/api-keys', req)
  }

  deleteApiKey(id: string) {
    return this.request<void>('DELETE', `/v1/api-keys/${id}`)
  }
}
