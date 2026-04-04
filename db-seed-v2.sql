-- Seed Default User (Dhilip K)
INSERT OR REPLACE INTO users (id, name, xp, level, attention_score)
VALUES ('user_dhilip_k', 'Dhilip K', 250, 5, 0.98);

-- Seed an initial productive post
INSERT OR REPLACE INTO posts (id, title, caption, content, category, author_id, author_name, author_level, xp, attention_score)
VALUES (
  'post_prod_1', 
  'The Art of Deep Work', 
  'Master your focus in a distracted world.', 
  'Deep work is the ability to focus without distraction on a cognitively demanding task...', 
  'Productivity', 
  'user_dhilip_k', 
  'Dhilip K', 
  5, 
  15, 
  0.95
);
