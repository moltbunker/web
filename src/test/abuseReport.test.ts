import { describe, it, expect } from 'vitest'
import {
  validateAbuseReport,
  MAX_DESCRIPTION_LEN,
  MAX_URL_LEN,
  type AbuseReport,
} from '@/lib/abuse-report'

const valid: AbuseReport = {
  report_type: 'DMCA',
  target_url: 'evil.moltbunker.dev',
  description: 'This subdomain hosts infringing copies of my book.',
  contact_email: 'rights@example.com',
}

describe('validateAbuseReport', () => {
  it('accepts a complete, valid report', () => {
    const r = validateAbuseReport(valid)
    expect(r.ok).toBe(true)
    expect(r.errors).toEqual({})
  })

  it('accepts a report with no contact email (anonymous)', () => {
    const r = validateAbuseReport({ ...valid, contact_email: '' })
    expect(r.ok).toBe(true)
  })

  it('accepts http(s) scheme, port, and path on the target', () => {
    expect(validateAbuseReport({ ...valid, target_url: 'https://a.b.moltbunker.dev/x?y=1' }).ok).toBe(true)
    expect(validateAbuseReport({ ...valid, target_url: 'http://foo.moltbunker.dev:8080' }).ok).toBe(true)
  })

  it('rejects an unknown report type', () => {
    const r = validateAbuseReport({ ...valid, report_type: 'Whatever' as AbuseReport['report_type'] })
    expect(r.ok).toBe(false)
    expect(r.errors.report_type).toBeTruthy()
  })

  it('rejects a missing report type', () => {
    const r = validateAbuseReport({ ...valid, report_type: undefined })
    expect(r.ok).toBe(false)
    expect(r.errors.report_type).toBeTruthy()
  })

  it('rejects a non-moltbunker.dev target', () => {
    for (const bad of [
      'example.com',
      'https://evil.com',
      'moltbunker.dev.evil.com',
      'notmoltbunker.dev',
      'evil.moltbunker.com',
    ]) {
      const r = validateAbuseReport({ ...valid, target_url: bad })
      expect(r.ok, `${bad} should be rejected`).toBe(false)
      expect(r.errors.target_url).toBeTruthy()
    }
  })

  it('rejects an empty target url', () => {
    const r = validateAbuseReport({ ...valid, target_url: '   ' })
    expect(r.ok).toBe(false)
    expect(r.errors.target_url).toBeTruthy()
  })

  it('rejects an over-long target url', () => {
    const longHost = 'a'.repeat(MAX_URL_LEN) + '.moltbunker.dev'
    const r = validateAbuseReport({ ...valid, target_url: longHost })
    expect(r.ok).toBe(false)
    expect(r.errors.target_url).toBeTruthy()
  })

  it('rejects an empty description', () => {
    const r = validateAbuseReport({ ...valid, description: '   ' })
    expect(r.ok).toBe(false)
    expect(r.errors.description).toBeTruthy()
  })

  it('rejects an over-long description', () => {
    const r = validateAbuseReport({ ...valid, description: 'x'.repeat(MAX_DESCRIPTION_LEN + 1) })
    expect(r.ok).toBe(false)
    expect(r.errors.description).toBeTruthy()
  })

  it('rejects a malformed contact email when provided', () => {
    const r = validateAbuseReport({ ...valid, contact_email: 'not-an-email' })
    expect(r.ok).toBe(false)
    expect(r.errors.contact_email).toBeTruthy()
  })
})
