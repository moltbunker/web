export type PresetCategory = 'ai' | 'infrastructure' | 'database' | 'dev'

export interface ImagePreset {
  id: string
  name: string
  image: string
  description: string
  category: PresetCategory
  defaultTier: 'minimal' | 'standard' | 'performance' | 'enterprise'
  tags: string[]
}

export const categoryLabels: Record<PresetCategory, string> = {
  ai: 'AI / ML',
  infrastructure: 'Infrastructure',
  database: 'Database',
  dev: 'Developer Tools',
}

export const presets: ImagePreset[] = [
  // AI/ML
  {
    id: 'ollama',
    name: 'Ollama',
    image: 'ollama/ollama:latest',
    description: 'Run LLMs locally — Llama 3, Mistral, Gemma, Phi',
    category: 'ai',
    defaultTier: 'performance',
    tags: ['llm', 'inference', 'gpu'],
  },
  {
    id: 'vllm',
    name: 'vLLM',
    image: 'vllm/vllm-openai:latest',
    description: 'High-throughput LLM serving with PagedAttention',
    category: 'ai',
    defaultTier: 'enterprise',
    tags: ['llm', 'serving', 'gpu'],
  },
  {
    id: 'tgi',
    name: 'Text Generation Inference',
    image: 'ghcr.io/huggingface/text-generation-inference:latest',
    description: 'HuggingFace optimized inference for text generation',
    category: 'ai',
    defaultTier: 'performance',
    tags: ['llm', 'inference', 'huggingface'],
  },
  {
    id: 'sd-webui',
    name: 'Stable Diffusion WebUI',
    image: 'stabilityai/stable-diffusion:latest',
    description: 'Image generation with AUTOMATIC1111 WebUI',
    category: 'ai',
    defaultTier: 'performance',
    tags: ['image', 'gpu', 'diffusion'],
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    image: 'comfyanonymous/comfyui:latest',
    description: 'Node-based Stable Diffusion workflow editor',
    category: 'ai',
    defaultTier: 'performance',
    tags: ['image', 'gpu', 'workflow'],
  },
  {
    id: 'jupyter',
    name: 'Jupyter Lab',
    image: 'jupyter/scipy-notebook:latest',
    description: 'Interactive notebooks for data science and ML',
    category: 'ai',
    defaultTier: 'standard',
    tags: ['notebook', 'python', 'data'],
  },

  // Infrastructure
  {
    id: 'nginx',
    name: 'Nginx',
    image: 'nginx:alpine',
    description: 'High-performance web server and reverse proxy',
    category: 'infrastructure',
    defaultTier: 'minimal',
    tags: ['web', 'proxy', 'http'],
  },
  {
    id: 'redis',
    name: 'Redis',
    image: 'redis:7-alpine',
    description: 'In-memory data store, cache, and message broker',
    category: 'infrastructure',
    defaultTier: 'standard',
    tags: ['cache', 'kv', 'pubsub'],
  },
  {
    id: 'minio',
    name: 'MinIO',
    image: 'minio/minio:latest',
    description: 'S3-compatible object storage',
    category: 'infrastructure',
    defaultTier: 'standard',
    tags: ['storage', 's3', 'object'],
  },
  {
    id: 'traefik',
    name: 'Traefik',
    image: 'traefik:v3.0',
    description: 'Cloud-native reverse proxy and load balancer',
    category: 'infrastructure',
    defaultTier: 'minimal',
    tags: ['proxy', 'lb', 'routing'],
  },

  // Database
  {
    id: 'postgres',
    name: 'PostgreSQL',
    image: 'postgres:16-alpine',
    description: 'Advanced open-source relational database',
    category: 'database',
    defaultTier: 'standard',
    tags: ['sql', 'relational', 'acid'],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    image: 'mongo:7',
    description: 'Document-oriented NoSQL database',
    category: 'database',
    defaultTier: 'standard',
    tags: ['nosql', 'document', 'json'],
  },
  {
    id: 'chromadb',
    name: 'ChromaDB',
    image: 'chromadb/chroma:latest',
    description: 'Open-source vector database for AI embeddings',
    category: 'database',
    defaultTier: 'standard',
    tags: ['vector', 'embeddings', 'ai'],
  },

  // Dev
  {
    id: 'code-server',
    name: 'VS Code Server',
    image: 'codercom/code-server:latest',
    description: 'Run VS Code in the browser',
    category: 'dev',
    defaultTier: 'standard',
    tags: ['ide', 'editor', 'browser'],
  },
  {
    id: 'n8n',
    name: 'n8n',
    image: 'n8nio/n8n:latest',
    description: 'Workflow automation platform',
    category: 'dev',
    defaultTier: 'standard',
    tags: ['automation', 'workflow', 'integration'],
  },
]

export function getPresetsByCategory(category: PresetCategory): ImagePreset[] {
  return presets.filter(p => p.category === category)
}

export function getPresetById(id: string): ImagePreset | undefined {
  return presets.find(p => p.id === id)
}
