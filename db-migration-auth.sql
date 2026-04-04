-- Migration: Add auth fields to users table
ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
ALTER TABLE users ADD COLUMN password TEXT;

-- Seed a primary user for testing
INSERT OR REPLACE INTO users (id, name, email, password, xp, level, attention_score)
VALUES ('user_dhilip_k', 'Dhilip K', 'dhilip@mindfulfeed.app', 'password123', 250, 3, 0.95);
