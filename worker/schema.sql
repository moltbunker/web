-- Abuse-report intake schema for the Cloudflare Worker /api/abuse endpoint.
-- Apply once before deploying the Worker:
--   wrangler d1 execute moltbunker-testnet --file=worker/schema.sql
--
-- CANONICAL SOURCE: migrations/0002_create_abuse_reports.sql (applied via
-- `wrangler d1 migrations apply`). This file is the manual-apply convenience
-- copy and MUST be kept in sync with that migration. Edit the migration first.
--
-- ip_hash is the SHA-256 of the reporter's IP (hex). We store the hash, not the
-- raw IP, so we can rate-limit without persisting raw PII (see Privacy Policy).

CREATE TABLE IF NOT EXISTS abuse_reports (
  id            TEXT PRIMARY KEY,
  report_type   TEXT NOT NULL,
  target_url    TEXT NOT NULL,
  description   TEXT NOT NULL,
  contact_email TEXT,
  ip_hash       TEXT,
  created_at    TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_abuse_reports_status ON abuse_reports(status);
CREATE INDEX IF NOT EXISTS idx_abuse_reports_created_at ON abuse_reports(created_at);
-- Supports the per-IP-per-hour rate-limit count query.
CREATE INDEX IF NOT EXISTS idx_abuse_reports_ip_hash ON abuse_reports(ip_hash, created_at);
