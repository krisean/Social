-- Add missing RLS policies for feed_users table
-- This fixes the AuthProvider's inability to query user profiles

-- Users can read feed user profiles (needed for AuthProvider)
CREATE POLICY "Anyone can read feed users"
  ON feed_users FOR SELECT
  USING (true);

-- Users can create their own profile (needed for AuthProvider)
CREATE POLICY "Users can create their own profile"
  ON feed_users FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    auth_user_id = auth.uid()::text OR
    auth_user_id IS NULL -- Allow anonymous users
  );

-- The update policy already exists, but let's ensure it's correct
DROP POLICY IF EXISTS "Users can update their own profile" ON feed_users;
CREATE POLICY "Users can update their own profile"
  ON feed_users FOR UPDATE
  USING (auth_user_id = auth.uid()::text)
  WITH CHECK (auth_user_id = auth.uid()::text);