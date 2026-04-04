-- MindfulFeed Database Schema for Cloudflare D1
-- Database ID: 9b0453b7-2cfe-4280-86da-8fa9c72eac34

-- Posts / Articles Table (unified feed + article content)
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

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT PRIMARY KEY,
  total_points INTEGER DEFAULT 0,
  badges TEXT DEFAULT '[]',
  quiz_progress TEXT DEFAULT '{}',
  last_active TEXT,
  created_at TEXT
);

-- User Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  activity_type TEXT,
  activity_data TEXT,
  timestamp TEXT
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
