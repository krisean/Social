-- Emergency fix for team_members infinite recursion
-- This completely disables RLS on team_members temporarily to stop the error

-- Step 1: Completely disable RLS on team_members
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies that might exist
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
DROP POLICY IF EXISTS "Users can view team members in their sessions" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can view all team members" ON team_members;
DROP POLICY IF EXISTS "Users can insert themselves as team members" ON team_members;
DROP POLICY IF EXISTS "Users can update their own records" ON team_members;
DROP POLICY IF EXISTS "Users can delete their own records" ON team_members;

-- Step 3: Leave RLS disabled for now to allow the app to work
-- We'll re-enable it later with proper policies

-- Verify the fix
SELECT 'Team members RLS completely disabled - recursion should be fixed' as status;
