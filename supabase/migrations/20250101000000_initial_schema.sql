-- Initial Schema Migration
-- Create core tables for multi-game event platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Venues table
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_email TEXT,
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  qr_code_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venue stats table
CREATE TABLE venue_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_scans INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_songs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, date)
);

-- Sessions table (supports multiple game types)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL, -- 'topcomment', 'vibox', etc.
  mode TEXT NOT NULL, -- 'event' or 'patron'
  host_id TEXT,
  phase_id TEXT NOT NULL DEFAULT 'lobby',
  phase_data JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  state JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  team_name TEXT,
  avatar_url TEXT,
  score INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Submissions table (answers, song requests, etc.)
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  round_number INTEGER,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  vote_count INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  is_moderated BOOLEAN DEFAULT false,
  moderation_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, voter_id)
);

-- Event rounds table (for multi-game events)
CREATE TABLE event_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  game_id TEXT NOT NULL,
  duration_seconds INTEGER,
  settings JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, round_number)
);

-- Indexes for performance
CREATE INDEX idx_sessions_venue_id ON sessions(venue_id);
CREATE INDEX idx_sessions_game_id ON sessions(game_id);
CREATE INDEX idx_sessions_phase_id ON sessions(phase_id);
CREATE INDEX idx_players_session_id ON players(session_id);
CREATE INDEX idx_submissions_session_id ON submissions(session_id);
CREATE INDEX idx_submissions_player_id ON submissions(player_id);
CREATE INDEX idx_votes_submission_id ON votes(submission_id);
CREATE INDEX idx_event_rounds_session_id ON event_rounds(session_id);

-- Enable Row Level Security
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rounds ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Venues: Public read, authenticated update
CREATE POLICY "Venues are publicly readable"
  ON venues FOR SELECT
  USING (true);

CREATE POLICY "Venue owners can update"
  ON venues FOR UPDATE
  USING (owner_email = auth.jwt()->>'email');

-- Sessions: Public read for active sessions
CREATE POLICY "Active sessions are publicly readable"
  ON sessions FOR SELECT
  USING (ended_at IS NULL OR ended_at > NOW() - INTERVAL '1 hour');

CREATE POLICY "Anyone can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Hosts can update their sessions"
  ON sessions FOR UPDATE
  USING (host_id = auth.uid()::text OR auth.role() = 'anon');

-- Players: Session-scoped access
CREATE POLICY "Players visible to session participants"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join as player"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update themselves"
  ON players FOR UPDATE
  USING (user_id = auth.uid()::text OR auth.role() = 'anon');

-- Submissions: Session-scoped access
CREATE POLICY "Submissions visible to session participants"
  ON submissions FOR SELECT
  USING (true);

CREATE POLICY "Players can create submissions"
  ON submissions FOR INSERT
  WITH CHECK (true);

-- Votes: Session-scoped access
CREATE POLICY "Votes visible to session participants"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can vote"
  ON votes FOR INSERT
  WITH CHECK (true);

-- Event rounds: Public read
CREATE POLICY "Event rounds are publicly readable"
  ON event_rounds FOR SELECT
  USING (true);

CREATE POLICY "Hosts can manage event rounds"
  ON event_rounds FOR ALL
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

