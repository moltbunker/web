interface Env {
  DB: D1Database
}

interface RegisterBody {
  twitter_handle: string
  wallet_address: string
}

const ALLOWED_ORIGINS = [
  'https://moltbunker.com',
  'https://www.moltbunker.com',
]

const MAX_BODY_SIZE = 1024 // 1KB
const RATE_LIMIT_WINDOW_MINUTES = 10
const RATE_LIMIT_MAX_REQUESTS = 5

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin') ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function json(data: unknown, status = 200, request?: Request) {
  const cors = request ? getCorsHeaders(request) : { 'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0] }
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...cors,
    },
  })
}

function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown'
}

async function isRateLimited(env: Env, ip: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()

  // Count recent requests and clean old entries in parallel
  const [result] = await Promise.all([
    env.DB.prepare(
      'SELECT COUNT(*) as count FROM rate_limits WHERE ip = ? AND created_at > ?'
    ).bind(ip, cutoff).first<{ count: number }>(),
    // Periodically clean old entries (1 in 10 chance to avoid doing it every request)
    Math.random() < 0.1
      ? env.DB.prepare('DELETE FROM rate_limits WHERE created_at < ?').bind(cutoff).run()
      : Promise.resolve(),
  ])

  return (result?.count ?? 0) >= RATE_LIMIT_MAX_REQUESTS
}

async function recordRequest(env: Env, ip: string) {
  await env.DB.prepare(
    'INSERT INTO rate_limits (ip) VALUES (?)'
  ).bind(ip).run()
}

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  return new Response(null, { status: 204, headers: getCorsHeaders(request) })
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const result = await env.DB.prepare('SELECT COUNT(*) as count FROM registrations').first<{ count: number }>()
  return json({ count: result?.count ?? 0 }, 200, request)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ip = getClientIP(request)

  // Rate limiting — check BEFORE any processing
  try {
    if (await isRateLimited(env, ip)) {
      return json({ error: 'Too many requests. Please try again later.' }, 429, request)
    }
  } catch {
    // Rate limit table might not exist yet, continue
  }

  // Record this attempt immediately (counts all attempts, not just successful ones)
  try { await recordRequest(env, ip) } catch { /* ignore */ }

  // Read and check actual body size
  const rawBody = await request.text()
  if (rawBody.length > MAX_BODY_SIZE) {
    return json({ error: 'Request too large' }, 413, request)
  }

  let body: RegisterBody
  try {
    body = JSON.parse(rawBody)
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, request)
  }

  const { twitter_handle, wallet_address } = body

  // Validate X handle
  if (!twitter_handle || typeof twitter_handle !== 'string') {
    return json({ error: 'X handle is required' }, 400, request)
  }

  const handle = twitter_handle.replace(/^@/, '').trim().toLowerCase()
  if (!/^[a-z0-9_]{1,15}$/.test(handle)) {
    return json({ error: 'Invalid X handle' }, 400, request)
  }

  // Validate wallet address
  if (!wallet_address || typeof wallet_address !== 'string') {
    return json({ error: 'Wallet address is required' }, 400, request)
  }

  const wallet = wallet_address.trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return json({ error: 'Invalid wallet address' }, 400, request)
  }

  // Insert into D1
  try {
    await env.DB.prepare(
      'INSERT INTO registrations (twitter_handle, wallet_address) VALUES (?, ?)'
    )
      .bind(handle, wallet)
      .run()

    return json({ success: true, message: 'Registration successful' }, 200, request)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('UNIQUE constraint failed')) {
      return json({ error: 'This X handle or wallet address is already registered' }, 409, request)
    }
    return json({ error: 'Registration failed. Please try again.' }, 500, request)
  }
}
