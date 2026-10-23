import { useContext, createContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiClient, DeployRequest, ReserveRequest, BotRequest, SnapshotRequest, RestoreRequest, CloneRequest, ApiKeyRequest, MoltSpec, MoltInvokeRequest, CrawlConfig, AgentSpec, AgentInvokeRequest, CreateEdgeRuleRequest, AddCustomHostnameRequest, RateLimitConfig } from '@/lib/api'
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
  catalog: ['catalog'] as const,
  status: ['status'] as const,
  balance: ['balance'] as const,
  threat: ['threat'] as const,
  containers: ['containers'] as const,
  container: (id: string) => ['containers', id] as const,
  containerLogs: (id: string) => ['containers', id, 'logs'] as const,
  containerMetrics: (id: string) => ['containers', id, 'metrics'] as const,
  deployments: ['deployments'] as const,
  deployment: (id: string) => ['deployments', id] as const,
  bots: ['bots'] as const,
  bot: (id: string) => ['bots', id] as const,
  botStatus: (id: string) => ['bots', id, 'status'] as const,
  snapshots: ['snapshots'] as const,
  clones: ['clones'] as const,
  apiKeys: ['api-keys'] as const,
  molts: ['molts'] as const,
  molt: (id: string) => ['molts', id] as const,
  moltMetrics: (id: string) => ['molts', id, 'metrics'] as const,
  moltLogs: (id: string) => ['molts', id, 'logs'] as const,
  crawlJobs: ['crawl-jobs'] as const,
  crawlJob: (id: string) => ['crawl-jobs', id] as const,
  crawlResults: (id: string) => ['crawl-jobs', id, 'results'] as const,
  crawlStats: ['crawl-stats'] as const,
  agents: ['agents'] as const,
  agent: (id: string) => ['agents', id] as const,
  agentMemory: (id: string) => ['agents', id, 'memory'] as const,
  edgeRules: (id: string) => ['edge', 'rules', id] as const,
  customHostnames: (id: string) => ['edge', 'hostnames', id] as const,
  rateLimitConfig: (id: string) => ['edge', 'rate-limit', id] as const,
}

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useCatalog() {
  const { client } = useApiClient()
  return useQuery({
    queryKey: keys.catalog,
    queryFn: () => client.getCatalog(),
    staleTime: 5 * 60_000,
  })
}

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
    refetchInterval: 30_000,
  })
}

export function useContainers() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.containers,
    queryFn: () => client.listContainers(),
    enabled: auth.isAuthenticated,
    refetchInterval: 30_000,
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

export function useContainerMetrics(id: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.containerMetrics(id),
    queryFn: () => client.fetchContainerMetrics(id),
    enabled: auth.isAuthenticated && !!id,
    refetchInterval: 15_000,
  })
}

export function useDeployments() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.deployments,
    queryFn: () => client.listDeployments(),
    enabled: auth.isAuthenticated,
    refetchInterval: 30_000,
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

export function useStartContainer() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.startContainer(id),
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

// ─── Molt Hooks ─────────────────────────────────────────────────────────────

export function useMolts() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.molts,
    queryFn: () => client.listMolts(),
    enabled: auth.isAuthenticated,
    refetchInterval: 15_000,
  })
}

export function useMolt(id: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.molt(id),
    queryFn: () => client.getMolt(id),
    enabled: auth.isAuthenticated && !!id,
    refetchInterval: 5_000,
  })
}

export function useMoltMetrics(id: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.moltMetrics(id),
    queryFn: () => client.getMoltMetrics(id),
    enabled: auth.isAuthenticated && !!id,
    refetchInterval: 10_000,
  })
}

export function useMoltLogs(id: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.moltLogs(id),
    queryFn: () => client.getMoltLogs(id, 200),
    enabled: auth.isAuthenticated && !!id,
    refetchInterval: 3_000,
  })
}

export function useDeployMolt() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (spec: MoltSpec) => client.deployMolt(spec),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.molts })
    },
  })
}

export function useStopMolt() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.stopMolt(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.molts })
    },
  })
}

export function useDeleteMolt() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.deleteMolt(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.molts })
    },
  })
}

export function useInvokeMolt() {
  const { client } = useApiClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: MoltInvokeRequest }) =>
      client.invokeMolt(id, req),
  })
}

// ─── Crawl Hooks ────────────────────────────────────────────────────────────

export function useCrawlJobs() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.crawlJobs,
    queryFn: () => client.listCrawlJobs(),
    enabled: auth.isAuthenticated,
    refetchInterval: 10_000,
  })
}

export function useCrawlJob(id: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.crawlJob(id),
    queryFn: () => client.getCrawlJob(id),
    enabled: auth.isAuthenticated && !!id,
    refetchInterval: 5_000,
  })
}

export function useCrawlResults(id: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.crawlResults(id),
    queryFn: () => client.getCrawlResults(id),
    enabled: auth.isAuthenticated && !!id,
  })
}

export function useCrawlStats() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.crawlStats,
    queryFn: () => client.getCrawlStats(),
    enabled: auth.isAuthenticated,
    refetchInterval: 30_000,
  })
}

export function useCreateCrawlJob() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (config: CrawlConfig) => client.createCrawlJob(config),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.crawlJobs })
      qc.invalidateQueries({ queryKey: keys.crawlStats })
    },
  })
}

export function useCancelCrawlJob() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.cancelCrawlJob(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.crawlJobs })
      qc.invalidateQueries({ queryKey: keys.crawlStats })
    },
  })
}

// ─── Agent Hooks ────────────────────────────────────────────────────────────

export function useAgents() {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.agents,
    queryFn: () => client.listAgents(),
    enabled: auth.isAuthenticated,
    refetchInterval: 15_000,
  })
}

export function useAgent(id: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.agent(id),
    queryFn: () => client.getAgent(id),
    enabled: auth.isAuthenticated && !!id,
    refetchInterval: 5_000,
  })
}

export function useAgentMemory(id: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.agentMemory(id),
    queryFn: () => client.listAgentMemory(id),
    enabled: auth.isAuthenticated && !!id,
  })
}

export function useDeployAgent() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (spec: AgentSpec) => client.deployAgent(spec),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.agents })
    },
  })
}

export function useStopAgent() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.stopAgent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.agents })
    },
  })
}

export function useDeleteAgent() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.deleteAgent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.agents })
    },
  })
}

export function useInvokeAgent() {
  const { client } = useApiClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: AgentInvokeRequest }) =>
      client.invokeAgent(id, req),
  })
}

export function useSetAgentMemory() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, entry }: { id: string; entry: { key: string; value: string } }) =>
      client.setAgentMemory(id, entry),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.agentMemory(vars.id) })
    },
  })
}

export function useDeleteAgentMemory() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, key }: { id: string; key: string }) =>
      client.deleteAgentMemory(id, key),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.agentMemory(vars.id) })
    },
  })
}

// ─── Edge / WAF Hooks (EDGE-01 / EDGE-02) ───────────────────────────────────

export function useEdgeRules(containerId: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.edgeRules(containerId),
    queryFn: () => client.listEdgeRules(containerId),
    enabled: auth.isAuthenticated && !!containerId,
    refetchInterval: 30_000,
  })
}

export function useCustomHostnames(containerId: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.customHostnames(containerId),
    queryFn: () => client.listCustomHostnames(containerId),
    enabled: auth.isAuthenticated && !!containerId,
    refetchInterval: 30_000,
  })
}

export function useRateLimitConfig(containerId: string) {
  const { client, auth } = useApiClient()
  return useQuery({
    queryKey: keys.rateLimitConfig(containerId),
    queryFn: () => client.getRateLimitConfig(containerId),
    enabled: auth.isAuthenticated && !!containerId,
    refetchInterval: 30_000,
  })
}

export function useCreateEdgeRule() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rule: CreateEdgeRuleRequest) => client.createEdgeRule(rule),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.edgeRules(vars.container_id) })
    },
  })
}

export function useDeleteEdgeRule() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, containerId }: { id: string; containerId: string }) =>
      client.deleteEdgeRule(id).then(() => containerId),
    onSuccess: (containerId) => {
      qc.invalidateQueries({ queryKey: keys.edgeRules(containerId) })
    },
  })
}

export function useAddCustomHostname() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: AddCustomHostnameRequest) => client.addCustomHostname(req),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.customHostnames(vars.container_id) })
    },
  })
}

export function useDeleteCustomHostname() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, containerId }: { id: string; containerId: string }) =>
      client.deleteCustomHostname(id).then(() => containerId),
    onSuccess: (containerId) => {
      qc.invalidateQueries({ queryKey: keys.customHostnames(containerId) })
    },
  })
}

export function useSetRateLimitConfig() {
  const { client } = useApiClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cfg: RateLimitConfig) => client.setRateLimitConfig(cfg),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.rateLimitConfig(vars.container_id) })
    },
  })
}
