interface Env {
  DB: D1Database
  ASSETS: Fetcher
}

// Simple in-memory rate limiter (per isolate — resets on redeploy)
const rateLimit = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60_000 // 1 minute
const RATE_LIMIT_MAX = 5 // max requests per window

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimit.get(ip) ?? []
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  if (recent.length >= RATE_LIMIT_MAX) return true
  recent.push(now)
  rateLimit.set(ip, recent)
  return false
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // Handle API routes
    if (url.pathname === '/api/register') {
      if (request.method === 'GET') {
        return handleGetCount(env)
      }
      if (request.method === 'POST') {
        const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
        if (isRateLimited(ip)) {
          return Response.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
        }
        return handleRegister(request, env)
      }
      return Response.json({ error: 'Method not allowed' }, { status: 405 })
    }

    // Everything else → static assets
    return env.ASSETS.fetch(request)
  },
}

async function handleGetCount(env: Env): Promise<Response> {
  try {
    const result = await env.DB.prepare('SELECT COUNT(*) as count FROM registrations').first<{ count: number }>()
    return Response.json({ count: result?.count ?? 0 })
  } catch {
    return Response.json({ count: 0 })
  }
}

async function handleRegister(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json<{ twitter_handle?: string; wallet_address?: string }>()

    const twitter = body.twitter_handle?.replace(/^@/, '').trim()
    const wallet = body.wallet_address?.trim()

    if (!twitter || !/^[a-zA-Z0-9_]{1,15}$/.test(twitter)) {
      return Response.json({ error: 'Invalid Twitter handle' }, { status: 400 })
    }

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return Response.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    // Check for existing registration
    const existing = await env.DB.prepare(
      'SELECT id FROM registrations WHERE twitter_handle = ? OR wallet_address = ?'
    )
      .bind(twitter.toLowerCase(), wallet.toLowerCase())
      .first()

    if (existing) {
      return Response.json({ error: 'Already registered' }, { status: 409 })
    }

    await env.DB.prepare(
      'INSERT INTO registrations (twitter_handle, wallet_address, created_at) VALUES (?, ?, ?)'
    )
      .bind(twitter.toLowerCase(), wallet.toLowerCase(), new Date().toISOString())
      .run()

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
