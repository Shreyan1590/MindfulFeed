-- MindfulFeed Database Schema for Cloudflare D1
-- Database ID: 9b0453b7-2cfe-4280-86da-8fa9c72eac34

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT PRIMARY KEY,
  total_points INTEGER DEFAULT 0,
  badges TEXT DEFAULT '[]',
  quiz_progress TEXT DEFAULT '{}',
  last_active TEXT,
  created_at TEXT
);

-- Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
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
  article_id TEXT,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_user_article ON chat_history(user_id, article_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at);

-- Insert sample data
INSERT OR IGNORE INTO articles (id, title, content, category, created_at) VALUES
(
  'article-1',
  'What is Artificial Intelligence?',
  'Artificial Intelligence (AI) is like giving computers a brain! Just like how you learn from your experiences, AI systems can learn from data...',
  'Technology',
  '2024-01-01T00:00:00Z'
),
(
  'article-2',
  'How Do Rainbows Form?',
  'Rainbows are one of nature''s most beautiful displays! They happen when sunlight and raindrops work together...',
  'Science',
  '2024-01-02T00:00:00Z'
),
(
  'article-3',
  'The Magic of Photosynthesis',
  'Plants are like tiny factories that make their own food! This amazing process is called photosynthesis...',
  'Nature',
  '2024-01-03T00:00:00Z'
);
