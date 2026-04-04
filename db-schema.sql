-- MindfulFeed Database Schema for Cloudflare D1
-- Database ID: 9b0453b7-2cfe-4280-86da-8fa9c72eac34

-- Users Table (Profile & Progress)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  attention_score REAL DEFAULT 1.0,
  badges TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Posts / Articles Table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT DEFAULT '[]',
  image_url TEXT,
  author_id TEXT,
  author_name TEXT,
  author_level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 10,
  attention_score REAL DEFAULT 0.85,
  content_quality TEXT DEFAULT 'productive',
  read_time TEXT DEFAULT '5 min read',
  views_count INTEGER DEFAULT 0,
  total_watch_time INTEGER DEFAULT 0, -- in seconds
  comments_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Interactions & Engagement Tracking
CREATE TABLE IF NOT EXISTS interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  post_id TEXT NOT NULL,
  time_spent INTEGER DEFAULT 0, -- session time in seconds
  xp_earned INTEGER DEFAULT 0,
  scroll_depth REAL DEFAULT 0,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- Activity Log (Extended)
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  activity_type TEXT, -- 'view', 'like', 'share', 'upload'
  activity_data TEXT,
  timestamp TEXT DEFAULT (datetime('now'))
);

-- Chat History
CREATE TABLE IF NOT EXISTS chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  post_id TEXT,
  message TEXT,
  role TEXT CHECK(role IN ('user', 'bot')),
  timestamp TEXT
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  language TEXT DEFAULT 'en',
  sound_enabled BOOLEAN DEFAULT 1,
  notifications_enabled BOOLEAN DEFAULT 1,
  theme TEXT DEFAULT 'default',
  updated_at TEXT
);

-- Precomputed Embeddings Table
CREATE TABLE IF NOT EXISTS post_embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding_vector TEXT NOT NULL, -- JSON string of the float array
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_user_post ON chat_history(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_embeddings_post ON post_embeddings(post_id);
