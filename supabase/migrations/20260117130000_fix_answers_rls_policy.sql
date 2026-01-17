-- Fix the answers RLS policy to allow updates
-- This ensures the resubmission feature works properly

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Teams can submit answers" ON answers;

-- Create new policy that allows both insert and update
CREATE POLICY "Teams can submit and update answers"
  ON answers FOR ALL
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = answers.team_id
      AND teams.uid = COALESCE(auth.uid()::text, teams.uid)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = answers.team_id
      AND teams.uid = COALESCE(auth.uid()::text, teams.uid)
    )
  );
