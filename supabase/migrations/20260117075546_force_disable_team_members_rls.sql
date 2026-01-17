-- Force disable RLS on team_members to fix instant removal issue
-- This handles existing policies gracefully

-- Drop all existing policies on team_members
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'team_members') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON team_members CASCADE';
    END LOOP;
END $$;

-- Disable RLS
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;