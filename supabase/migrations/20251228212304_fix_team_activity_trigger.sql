-- Fix the update_team_activity trigger function to handle different table structures

-- Update last_active_at on team activity
CREATE OR REPLACE FUNCTION update_team_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle both answers and votes tables
  IF TG_TABLE_NAME = 'answers' THEN
    UPDATE teams
    SET last_active_at = NOW()
    WHERE id = NEW.team_id;
  ELSIF TG_TABLE_NAME = 'votes' THEN
    UPDATE teams
    SET last_active_at = NOW()
    WHERE id = NEW.voter_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



