-- Casedevo Supabase Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  avatar_color text NOT NULL DEFAULT '#3b82f6',
  steam_name text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  balance numeric NOT NULL DEFAULT 100,
  case_win_boost_percent numeric NOT NULL DEFAULT 0,
  stats jsonb NOT NULL DEFAULT '{"casesOpened":0,"battlesPlayed":0,"upgradesTried":0,"bestDropValue":0,"totalWonValue":0,"totalCaseCost":0,"totalSoldValue":0}'::jsonb,
  activities jsonb NOT NULL DEFAULT '[]'::jsonb,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skin_data jsonb NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_drops (
  id text PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  username text NOT NULL,
  case_name text NOT NULL,
  skin_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS case_overrides (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS live_drops_created_at_idx ON live_drops(created_at DESC);
CREATE INDEX IF NOT EXISTS inventory_user_id_idx ON inventory(user_id);

-- Enable realtime for live_drops table
ALTER PUBLICATION supabase_realtime ADD TABLE live_drops;

-- Admin user (password: admin123, SHA-256 hash)
INSERT INTO profiles (id, username, email, password_hash, role, avatar_color, steam_name, bio, balance)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin',
  'admin@casedevo.local',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a',
  'admin',
  '#f97316',
  'Casedevo Admin',
  'Casedevo yönetim hesabı',
  1000
)
ON CONFLICT (username) DO NOTHING;
