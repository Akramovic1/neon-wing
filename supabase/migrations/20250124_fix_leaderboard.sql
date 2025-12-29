/*
  # Fix Leaderboard Schema and Policies
  1. Tables: Ensure leaderboard exists with correct constraints
  2. Security: Enable RLS and set public access policies
*/

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text UNIQUE NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access" ON leaderboard;
DROP POLICY IF EXISTS "Public insert access" ON leaderboard;
DROP POLICY IF EXISTS "Public update access" ON leaderboard;

-- Allow anyone to read the leaderboard
CREATE POLICY "Public read access" ON leaderboard FOR SELECT USING (true);

-- Allow anyone to insert/update scores
CREATE POLICY "Public insert access" ON leaderboard FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON leaderboard FOR UPDATE USING (true);
