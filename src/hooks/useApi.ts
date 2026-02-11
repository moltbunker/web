import { useContext, createContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiClient, DeployRequest, ReserveRequest, BotRequest, SnapshotRequest, RestoreRequest, CloneRequest, ApiKeyRequest } from '@/lib/api'
import type { AuthState } from '@/lib/auth'

// ─── Context ─────────────────────────────────────────────────────────────────

export interface ApiContextValue {
  client: ApiClient
  auth: AuthState
  authenticate: () => Promise<void>
  logout: () => void
}

export const ApiContext = createContext<ApiContextValue | null>(null)

export function useApiClient(): ApiContextValue {
  const ctx = useContext(ApiContext)
  if (!ctx) throw new Error('useApiClient must be used within ApiProvider')
  return ctx
}

export function useAuth() {
  const { auth, authenticate, logout } = useApiClient()
  return { ...auth, authenticate, logout }
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

const keys = {
  status: ['status'] as const,
  balance: ['balance'] as const,
  threat: ['threat'] as const,
  containers: ['containers'] as const,
  container: (id: string) => ['containers', id] as const,
  containerLogs: (id: string) => ['containers', id, 'logs'] as const,
  deployments: ['deployments'] as const,
  deployment: (id: string) => ['deployments', id] as const,
  bots: ['bots'] as const,
  bot: (id: string) => ['bots', id] as const,
  botStatus: (id: string) => ['bots', id, 'status'] as const,
  snapshots: ['snapshots'] as const,
  clones: ['clones'] as const,
  apiKeys: ['api-keys'] as const,
}

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useStatus() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.status,
    queryFn: () => client.getStatus(),
    enabled: auth.isAuthenticated,
    refetchInterval: 30_000,
  })
}

export function useBalance() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.balance,
    queryFn: () => client.getBalance(),
    enabled: auth.isAuthenticated,
    refetchInterval: 30_000,
  })
}

export function useThreat() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.threat,
    queryFn: () => client.getThreat(),
    enabled: auth.isAuthenticated,
    refetchInterval: 15_000,
  })
}

export function useContainers() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.containers,
    queryFn: () => client.listContainers(),
    enabled: auth.isAuthenticated,
    refetchInterval: 10_000,
  })
}

export function useContainer(id: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.container(id),
    queryFn: () => client.getContainer(id),
    enabled: auth.isAuthenticated && !!id,
    refetchInterval: 5_000,
  })
}

export function useContainerLogs(id: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.containerLogs(id),
    queryFn: () => client.getContainerLogs(id, 200),
    enabled: auth.isAuthenticated && !!id,
    refetchInterval: 3_000,
  })
}

export function useDeployments() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.deployments,
    queryFn: () => client.listDeployments(),
    enabled: auth.isAuthenticated,
    refetchInterval: 10_000,
  })
}

export function useBots() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.bots,
    queryFn: () => client.listBots(),
    enabled: auth.isAuthenticated,
  })
}

export function useBotStatus(id: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.botStatus(id),
    queryFn: () => client.getBotStatus(id),
    enabled: auth.isAuthenticated && !!id,
    refetchInterval: 5_000,
  })
}

export function useSnapshots() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.snapshots,
    queryFn: () => client.listSnapshots(),
    enabled: auth.isAuthenticated,
  })
}

export function useClones() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.clones,
    queryFn: () => client.listClones(),
    enabled: auth.isAuthenticated,
  })
}

export function useApiKeys() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.apiKeys,
    queryFn: () => client.listApiKeys(),
    enabled: auth.isAuthenticated,
  })
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

export function useDeploy() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: DeployRequest) => client.deploy(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.containers })
      qc.invalidateQueries({ queryKey: keys.balance })
    },
  })
}

export function useReserve() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: ReserveRequest) => client.reserve(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.balance })
    },
  })
}

export function useStopContainer() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.stopContainer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.containers })
    },
  })
}

export function useDeleteContainer() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.deleteContainer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.containers })
    },
  })
}

export function useCreateBot() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: BotRequest) => client.createBot(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.bots })
    },
  })
}

export function useDeleteBot() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.deleteBot(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.bots })
    },
  })
}

export function useCreateSnapshot() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: SnapshotRequest) => client.createSnapshot(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.snapshots })
    },
  })
}

export function useDeleteSnapshot() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.deleteSnapshot(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.snapshots })
    },
  })
}

export function useRestoreSnapshot() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: RestoreRequest }) =>
      client.restoreSnapshot(id, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.containers })
      qc.invalidateQueries({ queryKey: keys.snapshots })
    },
  })
}

export function useClone() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: CloneRequest) => client.clone(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.clones })
      qc.invalidateQueries({ queryKey: keys.containers })
    },
  })
}

export function useCreateApiKey() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: ApiKeyRequest) => client.createApiKey(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.apiKeys })
    },
  })
}

export function useDeleteApiKey() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.deleteApiKey(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.apiKeys })
    },
  })
}
