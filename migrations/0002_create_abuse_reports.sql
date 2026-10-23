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
CREATE INDEX IF NOT EXISTS idx_abuse_reports_ip_hash ON abuse_reports(ip_hash, created_at);
