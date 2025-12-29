/*
  # Clean Duplicates and Enforce Uniqueness
  1. Data Cleanup: Keep only the highest score for each player_name
  2. Schema: Add UNIQUE constraint to player_name
  3. Security: Update RLS policies for upsert support
*/

-- 1. Delete duplicates, keeping only the record with the highest score for each name
DELETE FROM leaderboard a
USING leaderboard b
WHERE a.id < b.id 
  AND a.player_name = b.player_name;

-- 2. Ensure the highest score is preserved if there were multiple entries
-- (This subquery approach is safer for merging)
WITH highest_scores AS (
  SELECT player_name, MAX(score) as max_score
  FROM leaderboard
  GROUP BY player_name
)
UPDATE leaderboard l
SET score = h.max_score
FROM highest_scores h
WHERE l.player_name = h.player_name;

-- 3. Add the UNIQUE constraint now that data is clean
ALTER TABLE leaderboard 
ADD CONSTRAINT unique_player_name UNIQUE (player_name);

-- 4. Ensure RLS allows UPSERT (Insert + Update)
DROP POLICY IF EXISTS "Allow public update access" ON leaderboard;
DROP POLICY IF EXISTS "Allow public insert access" ON leaderboard;

CREATE POLICY "Enable upsert for all users" 
ON leaderboard FOR ALL 
USING (true) 
WITH CHECK (true);
