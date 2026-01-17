-- Feed Schema for topcomment-247 Twitter-like feed
-- Separate from event-platform tables (sessions/teams/answers)

-- =============================================================================
-- FEED TABLES
-- =============================================================================

-- Feed Users: User profiles for the feed system
CREATE TABLE feed_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id TEXT UNIQUE, -- Supabase auth.uid (null for anonymous)
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create venues table if it doesn't exist
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  features JSONB DEFAULT '{"comments": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feed Posts: Content posts (comments, songs, polls - extensible via metadata)
CREATE TABLE feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES feed_users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL DEFAULT 'comment' CHECK (content_type IN ('comment', 'song', 'poll', 'challenge')),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- Extensible: song data, poll options, etc.
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feed Likes: Like/reaction system
CREATE TABLE feed_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES feed_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- One like per user per post
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Feed users indexes
CREATE INDEX idx_feed_users_auth_user_id ON feed_users(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX idx_feed_users_username ON feed_users(username);

-- Venues indexes
CREATE INDEX idx_venues_slug ON venues(slug);

-- Feed posts indexes
CREATE INDEX idx_feed_posts_venue_id ON feed_posts(venue_id);
CREATE INDEX idx_feed_posts_author_id ON feed_posts(author_id);
CREATE INDEX idx_feed_posts_created_at ON feed_posts(created_at DESC);
CREATE INDEX idx_feed_posts_content_type ON feed_posts(content_type);
CREATE INDEX idx_feed_posts_venue_created ON feed_posts(venue_id, created_at DESC); -- Composite for feed queries

-- Feed likes indexes
CREATE INDEX idx_feed_likes_post_id ON feed_likes(post_id);
CREATE INDEX idx_feed_likes_user_id ON feed_likes(user_id);

-- =============================================================================
-- TRIGGERS FOR LIKE COUNT MAINTENANCE
-- =============================================================================

-- Function to update like count
CREATE OR REPLACE FUNCTION update_feed_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the like_count in feed_posts based on actual likes
  UPDATE feed_posts
  SET like_count = (
    SELECT COUNT(*)
    FROM feed_likes
    WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
  )
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to maintain like_count
CREATE TRIGGER trigger_feed_likes_insert
  AFTER INSERT ON feed_likes
  FOR EACH ROW EXECUTE FUNCTION update_feed_post_like_count();

CREATE TRIGGER trigger_feed_likes_delete
  AFTER DELETE ON feed_likes
  FOR EACH ROW EXECUTE FUNCTION update_feed_post_like_count();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE feed_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_likes ENABLE ROW LEVEL SECURITY;

-- Feed Users Policies
-- Anyone can read user profiles
CREATE POLICY "Anyone can read feed users"
  ON feed_users FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile"
  ON feed_users FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    auth_user_id = auth.uid()::text OR 
    auth_user_id IS NULL -- Allow anonymous users
  );

-- Users can read feed user profiles
CREATE POLICY "Anyone can read feed users"
  ON feed_users FOR SELECT
  USING (true);

-- Users can create their own profile
CREATE POLICY "Users can create their own profile"
  ON feed_users FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    auth_user_id = auth.uid()::text OR
    auth_user_id IS NULL -- Allow anonymous users
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON feed_users FOR UPDATE
  USING (auth_user_id = auth.uid()::text)
  WITH CHECK (auth_user_id = auth.uid()::text);

-- Venues Policies
-- Anyone can read venues
CREATE POLICY "Anyone can read venues"
  ON venues FOR SELECT
  USING (true);

-- Only authenticated users can create venues (for now)
CREATE POLICY "Authenticated users can create venues"
  ON venues FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Feed Posts Policies
-- Anyone can read posts
CREATE POLICY "Anyone can read feed posts"
  ON feed_posts FOR SELECT
  USING (true);

-- Authenticated and anonymous users can create posts
CREATE POLICY "Users can create posts"
  ON feed_posts FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM feed_users
      WHERE feed_users.id = feed_posts.author_id
      AND (
        feed_users.auth_user_id = auth.uid()::text OR
        feed_users.is_anonymous = true
      )
    )
  );

-- Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON feed_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM feed_users
      WHERE feed_users.id = feed_posts.author_id
      AND feed_users.auth_user_id = auth.uid()::text
    )
  );

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON feed_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM feed_users
      WHERE feed_users.id = feed_posts.author_id
      AND feed_users.auth_user_id = auth.uid()::text
    )
  );

-- Feed Likes Policies
-- Anyone can read likes
CREATE POLICY "Anyone can read feed likes"
  ON feed_likes FOR SELECT
  USING (true);

-- Users can like posts
CREATE POLICY "Users can like posts"
  ON feed_likes FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM feed_users
      WHERE feed_users.id = feed_likes.user_id
      AND (
        feed_users.auth_user_id = auth.uid()::text OR
        feed_users.is_anonymous = true
      )
    )
  );

-- Users can unlike posts
CREATE POLICY "Users can unlike posts"
  ON feed_likes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM feed_users
      WHERE feed_users.id = feed_likes.user_id
      AND (
        feed_users.auth_user_id = auth.uid()::text OR
        feed_users.is_anonymous = true
      )
    )
  );

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Update like_count on feed_posts when likes are added/removed
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_posts
    SET like_count = like_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_posts
    SET like_count = like_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feed_likes_update_count
  AFTER INSERT OR DELETE ON feed_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_like_count();

-- Update last_active_at for feed_users on post creation
CREATE OR REPLACE FUNCTION update_feed_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feed_users
  SET last_active_at = NOW()
  WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feed_posts_update_user_activity
  AFTER INSERT ON feed_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_user_activity();

-- Update updated_at timestamp on feed_posts
CREATE OR REPLACE FUNCTION update_feed_posts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feed_posts_update_timestamp
  BEFORE UPDATE ON feed_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_posts_timestamp();

-- =============================================================================
-- REALTIME PUBLICATION
-- =============================================================================

-- Enable Realtime for feed tables
ALTER PUBLICATION supabase_realtime ADD TABLE feed_users;
ALTER PUBLICATION supabase_realtime ADD TABLE venues;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_likes;

-- =============================================================================
-- INITIAL DATA (Demo Venues)
-- =============================================================================

-- Insert demo venues for testing
INSERT INTO venues (name, slug, description, features) VALUES
  ('The Drunken Duck', 'the-drunken-duck', 'Best pub in town for comedy and community', '{"comments": true}'::jsonb),
  ('Mabels Pub', 'mabels-pub', 'Where locals gather for great times', '{"comments": true}'::jsonb),
  ('Craft Beer House', 'craft-beer-house', 'Premium craft beers and good vibes', '{"comments": true}'::jsonb),
  ('Sports Bar', 'sports-bar', 'Watch the game, share your thoughts', '{"comments": true}'::jsonb)
ON CONFLICT (slug) DO NOTHING;
