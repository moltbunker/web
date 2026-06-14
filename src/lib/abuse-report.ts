// Shared validation for the abuse-report intake form.
//
// This module is the single source of truth for the client-side validation
// rules. The Cloudflare Worker at `worker/index.ts` mirrors the same field
// limits server-side (it cannot import `@/` aliases, so the constants are kept
// intentionally simple and duplicated there). Keep the two in sync.

export const REPORT_TYPES = ['DMCA', 'CSAM', 'Malware', 'Spam', 'Other'] as const

export type ReportType = (typeof REPORT_TYPES)[number]

export interface AbuseReport {
  report_type: ReportType
  target_url: string
  description: string
  contact_email: string
}

// Field length caps — mirrored in worker/index.ts.
export const MAX_TYPE_LEN = 32
export const MAX_URL_LEN = 512
export const MAX_DESCRIPTION_LEN = 4096
export const MAX_EMAIL_LEN = 254

// A target must be a moltbunker.dev subdomain (the surface strangers expose),
// optionally with an http(s) scheme and a path/query. Reports about anything
// off-platform are rejected — we cannot action them.
const TARGET_URL_RE =
  /^(?:https?:\/\/)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.moltbunker\.dev(?::\d{1,5})?(?:\/[^\s]*)?$/

// Pragmatic email shape check. Server-side delivery (a follow-up Worker) is the
// real validator; this only catches obvious typos before submit.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface ValidationResult {
  ok: boolean
  errors: Partial<Record<keyof AbuseReport, string>>
}

export function validateAbuseReport(input: Partial<AbuseReport>): ValidationResult {
  const errors: Partial<Record<keyof AbuseReport, string>> = {}

  const reportType = input.report_type
  if (!reportType) {
    errors.report_type = 'Select a report type.'
  } else if (!REPORT_TYPES.includes(reportType)) {
    errors.report_type = 'Invalid report type.'
  } else if (reportType.length > MAX_TYPE_LEN) {
    errors.report_type = 'Report type is too long.'
  }

  const targetUrl = input.target_url?.trim() ?? ''
  if (!targetUrl) {
    errors.target_url = 'Enter the *.moltbunker.dev address you are reporting.'
  } else if (targetUrl.length > MAX_URL_LEN) {
    errors.target_url = `Address must be ${MAX_URL_LEN} characters or fewer.`
  } else if (!TARGET_URL_RE.test(targetUrl)) {
    errors.target_url = 'Address must be a *.moltbunker.dev hostname.'
  }

  const description = input.description?.trim() ?? ''
  if (!description) {
    errors.description = 'Describe the abuse so we can investigate.'
  } else if (description.length > MAX_DESCRIPTION_LEN) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LEN} characters or fewer.`
  }

  // Contact email is optional (anonymous reports are accepted) but, if
  // provided, must look like an address and respect the length cap.
  const contactEmail = input.contact_email?.trim() ?? ''
  if (contactEmail) {
    if (contactEmail.length > MAX_EMAIL_LEN) {
      errors.contact_email = `Email must be ${MAX_EMAIL_LEN} characters or fewer.`
    } else if (!EMAIL_RE.test(contactEmail)) {
      errors.contact_email = 'Enter a valid email address or leave it blank.'
    }
  }

  return { ok: Object.keys(errors).length === 0, errors }
}
