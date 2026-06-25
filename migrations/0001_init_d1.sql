PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_users (
  user_key TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'google',
  provider_subject_hash TEXT NOT NULL,
  email_hash TEXT,
  profile_encrypted TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_provider_subject
  ON app_users(provider, provider_subject_hash);

CREATE INDEX IF NOT EXISTS idx_app_users_email_hash
  ON app_users(email_hash);

CREATE TABLE IF NOT EXISTS user_data (
  user_key TEXT PRIMARY KEY,
  data_encrypted TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_key) REFERENCES app_users(user_key) ON DELETE CASCADE
);
