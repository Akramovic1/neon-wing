/*
  # Fix Sync Permissions for Leaderboard
  1. Changes:
    - Ensure RLS is enabled
    - Add explicit INSERT and UPDATE policies for anonymous users
    - Ensure the unique constraint on player_name exists for upsert logic
*/

-- 1. Ensure the table exists and has the unique constraint for upsert
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text UNIQUE NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public insert" ON leaderboard;
DROP POLICY IF EXISTS "Allow public update" ON leaderboard;
DROP POLICY IF EXISTS "Allow public select" ON leaderboard;
DROP POLICY IF EXISTS "Allow public update access" ON leaderboard;

-- 3. Create comprehensive policies for the 'anon' role
CREATE POLICY "Enable read access for all users" 
ON leaderboard FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON leaderboard FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON leaderboard FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- 4. Grant explicit table permissions to the anon role
GRANT ALL ON TABLE leaderboard TO anon;
GRANT ALL ON TABLE leaderboard TO postgres;
