-- Create team_members table
-- This table tracks individual members of each team

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_captain BOOLEAN DEFAULT FALSE,
    
    -- Ensure a user can only join a team once per device
    UNIQUE(team_id, user_id, device_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_device ON team_members(device_id);
CREATE INDEX IF NOT EXISTS idx_team_members_captain ON team_members(team_id, is_captain);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy for team_members
-- Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON team_members
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');