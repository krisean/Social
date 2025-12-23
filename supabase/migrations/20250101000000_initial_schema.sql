-- Event Platform Schema for Supabase
-- Clean, modern design optimized for real-time multiplayer games

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Sessions: Main game sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- Join code like "ABC123"
  host_uid TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby', -- lobby, answer, vote, results, ended
  round_index INTEGER NOT NULL DEFAULT 0,
  rounds JSONB NOT NULL DEFAULT '[]', -- Array of round objects with prompts and groups
  vote_group_index INTEGER, -- Which group is currently voting
  prompt_deck JSONB NOT NULL DEFAULT '[]', -- Shuffled deck of prompts
  prompt_cursor INTEGER NOT NULL DEFAULT 0,
  prompt_library_id TEXT NOT NULL DEFAULT 'classic',
  settings JSONB NOT NULL DEFAULT '{"answerSecs": 90, "voteSecs": 90, "resultsSecs": 12, "maxTeams": 24}',
  venue_name TEXT,
  venue_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ, -- When current phase ends
  CONSTRAINT valid_status CHECK (status IN ('lobby', 'answer', 'vote', 'results', 'ended'))
);

-- Teams: Players in a session
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  uid TEXT NOT NULL, -- User's auth.uid
  team_name TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  score INTEGER NOT NULL DEFAULT 0,
  mascot_id INTEGER,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, uid)
);

-- Answers: Team submissions for prompts
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  round_index INTEGER NOT NULL,
  group_id TEXT NOT NULL,
  text TEXT NOT NULL,
  masked BOOLEAN NOT NULL DEFAULT false, -- Profanity filtered
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes: Team votes on answers
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  round_index INTEGER NOT NULL,
  group_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(voter_id, round_index, group_id) -- One vote per team per round/group
);

-- Analytics: Session statistics
CREATE TABLE session_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  joined_count INTEGER NOT NULL DEFAULT 0,
  answer_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  vote_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0, -- seconds
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_sessions_status ON sessions(status) WHERE status != 'ended';
CREATE INDEX idx_sessions_host ON sessions(host_uid);
CREATE INDEX idx_teams_session ON teams(session_id);
CREATE INDEX idx_teams_uid ON teams(uid);
CREATE INDEX idx_answers_session_round ON answers(session_id, round_index);
CREATE INDEX idx_answers_team ON answers(team_id);
CREATE INDEX idx_votes_session_round ON votes(session_id, round_index);
CREATE INDEX idx_votes_answer ON votes(answer_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- Sessions: Read all active, create anon, update by host
CREATE POLICY "Anyone can read active sessions"
  ON sessions FOR SELECT
  USING (status != 'ended' OR ended_at > NOW() - INTERVAL '1 hour');

CREATE POLICY "Authenticated users can create sessions"
  ON sessions FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Hosts can update their sessions"
  ON sessions FOR UPDATE
  USING (host_uid = auth.uid()::text);

-- Teams: Read all in session, insert/update own
CREATE POLICY "Anyone can read teams"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Users can join as team"
  ON teams FOR INSERT
  TO authenticated, anon
  WITH CHECK (uid = COALESCE(auth.uid()::text, uid));

CREATE POLICY "Users can update their team"
  ON teams FOR UPDATE
  USING (uid = auth.uid()::text);

-- Answers: Read all in session, insert own
CREATE POLICY "Anyone can read answers"
  ON answers FOR SELECT
  USING (true);

CREATE POLICY "Teams can submit answers"
  ON answers FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = answers.team_id
      AND teams.uid = auth.uid()::text
    )
  );

-- Votes: Read all in session, insert own
CREATE POLICY "Anyone can read votes"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Teams can submit votes"
  ON votes FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = votes.voter_id
      AND teams.uid = auth.uid()::text
    )
  );

-- Analytics: Only host can read
CREATE POLICY "Hosts can read analytics"
  ON session_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_analytics.session_id
      AND sessions.host_uid = auth.uid()::text
    )
  );

-- =============================================================================
-- DATABASE FUNCTIONS
-- =============================================================================

-- Update last_active_at on team activity
CREATE OR REPLACE FUNCTION update_team_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE teams
  SET last_active_at = NOW()
  WHERE id = NEW.team_id OR id = NEW.voter_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER answer_updates_activity
  AFTER INSERT ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_team_activity();

CREATE TRIGGER vote_updates_activity
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_team_activity();

-- Update vote count when votes are added
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- This is just for tracking, actual vote counting done in queries
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluded confusing chars
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check if code exists
CREATE OR REPLACE FUNCTION ensure_unique_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  attempts INTEGER := 0;
BEGIN
  LOOP
    new_code := generate_room_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM sessions WHERE code = new_code);
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique code';
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- REALTIME PUBLICATION
-- =============================================================================

-- Enable Realtime for all game tables
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Create analytics records for existing sessions (if any)
INSERT INTO session_analytics (session_id)
SELECT id FROM sessions
ON CONFLICT (session_id) DO NOTHING;
