-- Add player_name column to team_members table
-- This will store the display name of each team member

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS player_name VARCHAR(255);

-- Update existing records to have a default player name based on user_id
UPDATE team_members 
SET player_name = 'Player ' || SUBSTRING(user_id::text, 1, 8)
WHERE player_name IS NULL;