/*
  # Database Authorization Fix
  1. Tables: Ensure leaderboard exists.
  2. Security: Reset RLS and grant public access to anon role.
*/

-- Ensure table exists
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text UNIQUE NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "public_select" ON leaderboard;
    DROP POLICY IF EXISTS "public_insert" ON leaderboard;
    DROP POLICY IF EXISTS "public_update" ON leaderboard;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create permissive policies for the game
CREATE POLICY "public_select" ON leaderboard FOR SELECT TO anon USING (true);
CREATE POLICY "public_insert" ON leaderboard FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_update" ON leaderboard FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Explicitly grant table permissions to the anon role
GRANT ALL ON TABLE leaderboard TO anon;
GRANT ALL ON TABLE leaderboard TO authenticated;
