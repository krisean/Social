-- Update banned_teams table to ban by UID instead of team_name
-- This prevents banned users from rejoining with a different team name

-- Add uid column if it doesn't exist
ALTER TABLE banned_teams ADD COLUMN IF NOT EXISTS uid TEXT;

-- Create index on uid for faster lookups
CREATE INDEX IF NOT EXISTS idx_banned_teams_session_uid ON banned_teams(session_id, uid);

-- Update the unique constraint to use uid instead of team_name
ALTER TABLE banned_teams DROP CONSTRAINT IF EXISTS banned_teams_session_id_team_id_key;
ALTER TABLE banned_teams DROP CONSTRAINT IF EXISTS banned_teams_session_id_team_name_key;
ALTER TABLE banned_teams ADD CONSTRAINT banned_teams_session_id_uid_key UNIQUE(session_id, uid);

-- Make uid NOT NULL for new entries (existing entries can be null for backwards compatibility)
-- We'll handle this in the application logic
