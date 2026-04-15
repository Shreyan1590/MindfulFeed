-- MindfulFeed Database Schema for Cloudflare D1
-- Canonical schema aligned with the live Cloudflare D1 database.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_active_date TEXT,
  attention_score REAL DEFAULT 0.0,
  mode TEXT DEFAULT 'growth',
  auth_token TEXT,
  password TEXT,
  name TEXT,
  xp INTEGER DEFAULT 0,
  badges TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT,
  content TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  xp INTEGER DEFAULT 10,
  attention_score REAL DEFAULT 0.85,
  content_quality TEXT DEFAULT 'productive',
  read_time TEXT DEFAULT '5 min read',
  views INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  author_name TEXT DEFAULT 'MindfulFeed Team',
  author_avatar TEXT,
  author_level INTEGER DEFAULT 1,
  tags TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_id TEXT NOT NULL,
  category TEXT NOT NULL,
  is_like INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_interests (
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  total_watch_time INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, category),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  activity_type TEXT,
  activity_data TEXT,
  timestamp TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  post_id TEXT,
  message TEXT,
  role TEXT CHECK(role IN ('user', 'bot')),
  timestamp TEXT
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT PRIMARY KEY,
  total_points INTEGER DEFAULT 0,
  badges TEXT DEFAULT '[]',
  quiz_progress TEXT DEFAULT '{}',
  last_active TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  language TEXT DEFAULT 'en',
  sound_enabled BOOLEAN DEFAULT 1,
  notifications_enabled BOOLEAN DEFAULT 1,
  theme TEXT DEFAULT 'default',
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS post_embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding_vector TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_user_post ON chat_history(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_post ON interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_post ON post_embeddings(post_id);
