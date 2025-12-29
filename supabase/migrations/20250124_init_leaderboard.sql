/*
  # Initialize Leaderboard System
  1. Tables:
    - `leaderboard`: Stores player scores with unique names for upserting.
  2. Security:
    - Enable RLS.
    - Add policies for public (anon) access to read and update scores.
*/

-- Create the leaderboard table if it doesn't exist
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text UNIQUE NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view the leaderboard
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access') THEN
    CREATE POLICY "Allow public read access" ON leaderboard FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- Policy: Allow anyone to insert a new score
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert access') THEN
    CREATE POLICY "Allow public insert access" ON leaderboard FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- Policy: Allow anyone to update a score (required for upsert logic)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update access') THEN
    CREATE POLICY "Allow public update access" ON leaderboard FOR UPDATE TO anon USING (true);
  END IF;
END $$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard (score DESC);
