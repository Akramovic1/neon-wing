/*
  # Create leaderboard table
  1. New Tables: leaderboard (id, player_name, score, created_at, updated_at)
  2. Security: Enable RLS, add public read and upsert policies
*/
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text UNIQUE NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the leaderboard
CREATE POLICY "Public read access" ON leaderboard FOR SELECT USING (true);

-- Allow anyone to upsert scores (simplified for this game)
CREATE POLICY "Public upsert access" ON leaderboard FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON leaderboard FOR UPDATE USING (true);
