export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  tags: string[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'serverless-runtimes',
    title: 'Molts: Serverless Runtimes on a Decentralized Network',
    excerpt:
      'Not every workload needs a full container. Molts bring dual-runtime serverless (WASM + JS/TS) to MoltBunker — functions that start in microseconds, run on any provider node, and cost fractions of a cent per invocation.',
    date: '2026-03-02',
    readingTime: '11 min read',
    tags: ['Molts', 'Serverless', 'WebAssembly', 'Deno'],
  },
  {
    slug: 'web4-and-moltbunker',
    title: 'Web 4.0 and the Missing Infrastructure Layer',
    excerpt:
      'The internet is entering its fourth era. Not because someone declared it, but because the technology to support it finally exists. Autonomous agents, machine-to-machine economies, and computation that no single party controls.',
    date: '2026-02-19',
    readingTime: '12 min read',
    tags: ['Web 4.0', 'Infrastructure', 'Confidential Computing'],
  },
]
