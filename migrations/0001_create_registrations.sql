CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  twitter_handle TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(twitter_handle),
  UNIQUE(wallet_address)
);
