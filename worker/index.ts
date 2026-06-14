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

// ---- Abuse-report intake ----
// Field caps mirror src/lib/abuse-report.ts. The Worker is the authority; the
// client validation is a UX convenience.
const ABUSE_REPORT_TYPES = ['DMCA', 'CSAM', 'Malware', 'Spam', 'Other']
const ABUSE_MAX_URL_LEN = 512
const ABUSE_MAX_DESCRIPTION_LEN = 4096
const ABUSE_MAX_EMAIL_LEN = 254
// Reports must concern a *.moltbunker.dev address (the surface users expose).
const ABUSE_TARGET_RE =
  /^(?:https?:\/\/)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.moltbunker\.dev(?::\d{1,5})?(?:\/[^\s]*)?$/
const ABUSE_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Durable, cross-isolate rate limit: max abuse reports per IP per hour (D1).
const ABUSE_RATE_LIMIT_MAX = 5
const ABUSE_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
// Reject obviously oversized bodies before buffering. The largest legitimate
// report is bounded by ABUSE_MAX_* (URL 512 + description 4096 + email 254 +
// type + JSON overhead); 16 KB is generous headroom.
const ABUSE_MAX_BODY_BYTES = 16 * 1024

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

    if (url.pathname === '/api/abuse') {
      if (request.method === 'POST') {
        const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
        // Cheap isolate-local pre-filter in front of the durable D1 limiter.
        // Mirrors /api/register and blunts a tight concurrent burst from one IP
        // before any D1 round-trip (the COUNT-then-INSERT D1 path is a benign
        // TOCTOU under concurrency).
        if (isRateLimited(ip)) {
          return Response.json({ error: 'Too many reports. Try again later.' }, { status: 429 })
        }
        // Reject oversized bodies before buffering via request.json().
        const contentLength = Number(request.headers.get('Content-Length') ?? '0')
        if (Number.isFinite(contentLength) && contentLength > ABUSE_MAX_BODY_BYTES) {
          return Response.json({ error: 'Request body too large' }, { status: 413 })
        }
        return handleAbuseReport(request, env)
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

    // Check for existing registration (only by wallet address)
    const existing = await env.DB.prepare(
      'SELECT id FROM registrations WHERE wallet_address = ?'
    )
      .bind(wallet.toLowerCase())
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

interface AbuseReportBody {
  report_type?: string
  target_url?: string
  description?: string
  contact_email?: string
}

async function handleAbuseReport(request: Request, env: Env): Promise<Response> {
  let body: AbuseReportBody
  try {
    body = await request.json<AbuseReportBody>()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const reportType = (body.report_type ?? '').trim()
  const targetUrl = (body.target_url ?? '').trim()
  const description = (body.description ?? '').trim()
  const contactEmail = (body.contact_email ?? '').trim()

  if (!ABUSE_REPORT_TYPES.includes(reportType)) {
    return Response.json({ error: 'Invalid report type' }, { status: 400 })
  }
  if (!targetUrl || targetUrl.length > ABUSE_MAX_URL_LEN || !ABUSE_TARGET_RE.test(targetUrl)) {
    return Response.json({ error: 'target_url must be a *.moltbunker.dev address' }, { status: 400 })
  }
  if (!description || description.length > ABUSE_MAX_DESCRIPTION_LEN) {
    return Response.json({ error: 'description is required' }, { status: 400 })
  }
  if (contactEmail) {
    if (contactEmail.length > ABUSE_MAX_EMAIL_LEN || !ABUSE_EMAIL_RE.test(contactEmail)) {
      return Response.json({ error: 'Invalid contact_email' }, { status: 400 })
    }
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'

  // Durable rate limit: count this IP's reports in the trailing window. We hash
  // the IP so raw addresses are not persisted as PII in the reports table.
  const ipHash = await hashIp(ip)
  const since = new Date(Date.now() - ABUSE_RATE_LIMIT_WINDOW_MS).toISOString()
  try {
    const recent = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM abuse_reports WHERE ip_hash = ? AND created_at >= ?'
    )
      .bind(ipHash, since)
      .first<{ count: number }>()
    if ((recent?.count ?? 0) >= ABUSE_RATE_LIMIT_MAX) {
      return Response.json({ error: 'Too many reports. Try again later.' }, { status: 429 })
    }
  } catch {
    // If the rate-limit query fails (e.g. table missing), fall through to the
    // insert which will surface a 503 below.
  }

  const id = crypto.randomUUID()
  try {
    await env.DB.prepare(
      `INSERT INTO abuse_reports
         (id, report_type, target_url, description, contact_email, ip_hash, created_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
    )
      .bind(
        id,
        reportType,
        targetUrl,
        description,
        contactEmail || null,
        ipHash,
        new Date().toISOString(),
      )
      .run()
  } catch {
    return Response.json({ error: 'Could not record report' }, { status: 503 })
  }

  return Response.json(
    { id, message: 'Report received. We acknowledge within 2 business days.' },
    { status: 201 },
  )
}

// SHA-256 of the connecting IP, hex-encoded. Lets us rate-limit by IP without
// storing raw addresses (data minimisation; see Privacy Policy).
async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
