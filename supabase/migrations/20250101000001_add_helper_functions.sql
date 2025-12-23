-- Helper functions for Edge Functions

-- Function to increment team score
CREATE OR REPLACE FUNCTION increment_team_score(team_id UUID, score_delta INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE teams
  SET score = score + score_delta
  WHERE id = team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_team_score TO authenticated, anon;


