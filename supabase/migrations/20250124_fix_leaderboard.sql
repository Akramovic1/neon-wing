/*
  # Fix Leaderboard Constraints and Policies
  1. Changes:
    - Add UNIQUE constraint to player_name to allow targeted updates
    - Add UPDATE policy for public access
*/

-- Ensure player_name is unique
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_player_name') THEN
    ALTER TABLE leaderboard ADD CONSTRAINT unique_player_name UNIQUE (player_name);
  END IF;
END $$;

-- Allow public updates (required for score progression)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'leaderboard' AND policyname = 'Allow public update access'
  ) THEN
    CREATE POLICY "Allow public update access" 
      ON leaderboard FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
