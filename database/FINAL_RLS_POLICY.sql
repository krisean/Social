-- Final RLS Policy for team_members
-- Based on actual database schema analysis
-- This matches the actual UUID types in the database

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view team members in their teams" ON team_members;
DROP POLICY IF EXISTS "Users can insert themselves as team members" ON team_members;
DROP POLICY IF EXISTS "Users can update their own team member records" ON team_members;
DROP POLICY IF EXISTS "Users can delete their own team member records" ON team_members;
DROP POLICY IF EXISTS "Hosts can manage team members in their sessions" ON team_members;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can manage team members" ON team_members;
DROP POLICY IF EXISTS "Anonymous users can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Users can view team members in sessions they joined" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can view all team members" ON team_members;
DROP POLICY IF EXISTS "Users can update own records" ON team_members;
DROP POLICY IF EXISTS "Users can delete own records" ON team_members;

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can view all team members (needed for lobby)
CREATE POLICY "Authenticated users can view all team members" ON team_members
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy 2: Users can insert themselves as team members
CREATE POLICY "Users can insert themselves as team members" ON team_members
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        (user_id = auth.uid() OR user_id IS NULL)
    );

-- Policy 3: Users can update their own records
CREATE POLICY "Users can update own records" ON team_members
    FOR UPDATE USING (user_id = auth.uid());

-- Policy 4: Users can delete their own records
CREATE POLICY "Users can delete own records" ON team_members
    FOR DELETE USING (user_id = auth.uid());

-- Verify policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies
WHERE tablename = 'team_members'
ORDER BY policyname;
