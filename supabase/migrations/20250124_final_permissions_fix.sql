/*
  # Final Leaderboard Permissions Fix
  1. Tables:
    - Ensure `leaderboard` table exists with unique constraint on `player_name`.
  2. Security:
    - Enable RLS.
    - Drop all existing policies to start fresh.
    - Create explicit policies for public (anon) access.
    - Grant table permissions to anon and authenticated roles.
*/

-- 1. Table Setup
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text UNIQUE NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Security Reset
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON leaderboard;
DROP POLICY IF EXISTS "Enable insert access for all users" ON leaderboard;
DROP POLICY IF EXISTS "Enable update access for all users" ON leaderboard;
DROP POLICY IF EXISTS "Allow public read access" ON leaderboard;
DROP POLICY IF EXISTS "Allow public insert access" ON leaderboard;
DROP POLICY IF EXISTS "Allow public update access" ON leaderboard;

-- 3. Create Clean Policies
CREATE POLICY "public_select" ON leaderboard FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert" ON leaderboard FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update" ON leaderboard FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Grant Permissions
GRANT ALL ON TABLE leaderboard TO anon;
GRANT ALL ON TABLE leaderboard TO authenticated;
GRANT ALL ON TABLE leaderboard TO postgres;
GRANT ALL ON TABLE leaderboard TO service_role;
