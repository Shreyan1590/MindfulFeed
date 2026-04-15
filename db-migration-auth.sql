-- Auth compatibility migration for older MindfulFeed D1 databases.
-- Fresh databases should use db-schema.sql instead.
--
-- This migration upgrades the original simple users table so it works with the
-- current worker and production auth flow.

ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN photo_url TEXT;
ALTER TABLE users ADD COLUMN total_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN best_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_active_date TEXT;
ALTER TABLE users ADD COLUMN mode TEXT DEFAULT 'growth';
ALTER TABLE users ADD COLUMN auth_token TEXT;
ALTER TABLE users ADD COLUMN password TEXT;
ALTER TABLE users ADD COLUMN name TEXT;
ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN badges TEXT DEFAULT '[]';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

UPDATE users
SET
  display_name = COALESCE(display_name, name),
  total_xp = COALESCE(total_xp, xp, 0),
  badges = COALESCE(badges, '[]'),
  password_hash = COALESCE(password_hash, password);

INSERT OR IGNORE INTO users (
  id,
  email,
  password_hash,
  display_name,
  name,
  total_xp,
  xp,
  level,
  attention_score,
  mode,
  badges
)
VALUES (
  'user_dhilip_k',
  'dhilip@mindfulfeed.app',
  'password123',
  'Dhilip K',
  'Dhilip K',
  250,
  250,
  3,
  0.95,
  'growth',
  '[]'
);
