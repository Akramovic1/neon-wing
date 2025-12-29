/*
  # Emergency Leaderboard Fix
  1. Create table if missing
  2. Reset RLS and grant public access
*/

-- 1. Create Table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text UNIQUE NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Enable Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 3. Drop and Recreate Policies (Safe Block)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "public_select" ON leaderboard;
    DROP POLICY IF EXISTS "public_insert" ON leaderboard;
    DROP POLICY IF EXISTS "public_update" ON leaderboard;
EXCEPTION
    WHEN others THEN null;
END $$;

CREATE POLICY "public_select" ON leaderboard FOR SELECT TO anon USING (true);
CREATE POLICY "public_insert" ON leaderboard FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_update" ON leaderboard FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 4. Grant Permissions
GRANT ALL ON TABLE leaderboard TO anon;
GRANT ALL ON TABLE leaderboard TO authenticated;
GRANT ALL ON TABLE leaderboard TO service_role;
