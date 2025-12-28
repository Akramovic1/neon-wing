/*
  # Create leaderboard table for Neon Wing
  1. New Tables: leaderboard (id, player_name, score, created_at)
  2. Security: Enable RLS, add public read/insert policies
*/

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read the leaderboard
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leaderboard' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON public.leaderboard FOR SELECT USING (true);
  END IF;
END $$;

-- Policy: Allow anyone to submit a score
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leaderboard' AND policyname = 'Public insert access'
  ) THEN
    CREATE POLICY "Public insert access" ON public.leaderboard FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Create index for performance on high scores
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard (score DESC);