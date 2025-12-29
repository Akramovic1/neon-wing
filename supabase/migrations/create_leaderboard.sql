/*
  # Create Leaderboard Table
  1. New Tables:
    - `leaderboard`
      - `id` (uuid, primary key)
      - `player_name` (text, not null)
      - `score` (integer, default 0)
      - `created_at` (timestamp with time zone, default now())
  2. Security:
    - Enable RLS on `leaderboard` table
    - Add policy for public to read scores
    - Add policy for public to insert scores
*/

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the leaderboard
CREATE POLICY "Allow public read access" 
  ON leaderboard FOR SELECT 
  USING (true);

-- Allow anyone to submit a score
CREATE POLICY "Allow public insert access" 
  ON leaderboard FOR INSERT 
  WITH CHECK (true);

-- Create index for performance on score queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard (score DESC);
