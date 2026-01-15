-- Create table to track banned teams from sessions
-- This allows us to distinguish between kicks (temporary) and bans (permanent)

CREATE TABLE IF NOT EXISTS banned_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL,
  team_name TEXT NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  banned_by UUID REFERENCES auth.users(id), -- Host who performed the ban
  reason TEXT, -- Optional reason for the ban
  
  -- Ensure a team can only be banned once per session
  UNIQUE(session_id, team_id)
);

-- Create index for faster lookups when checking if a team is banned
CREATE INDEX IF NOT EXISTS idx_banned_teams_session_team ON banned_teams(session_id, team_id);
CREATE INDEX IF NOT EXISTS idx_banned_teams_team_id ON banned_teams(team_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE banned_teams ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all bans (for Edge Functions)
CREATE POLICY "Service role full access to bans"
  ON banned_teams FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Allow authenticated users to read bans (for frontend to check)
CREATE POLICY "Authenticated users can view bans"
  ON banned_teams FOR SELECT
  USING (auth.role() = 'authenticated');
