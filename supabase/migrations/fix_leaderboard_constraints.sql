/*
  # Fix Leaderboard Constraints and Policies
  1. Changes:
    - Add UNIQUE constraint to player_name to allow upserts/logic checks
    - Update RLS policies to allow UPDATE operations
*/

-- Ensure player_name is unique so we can target specific players
ALTER TABLE leaderboard ADD CONSTRAINT unique_player_name UNIQUE (player_name);

-- Add policy to allow public updates (restricted by logic in App.tsx)
CREATE POLICY "Allow public update access" 
  ON leaderboard FOR UPDATE
  USING (true)
  WITH CHECK (true);
