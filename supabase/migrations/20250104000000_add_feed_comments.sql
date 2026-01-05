-- Feed Comments - Allow users to comment on posts
-- Migration created: 2025-01-04

-- =============================================================================
-- FEED COMMENTS TABLE
-- =============================================================================

-- Feed Comments: Allow users to comment on posts
CREATE TABLE feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES feed_users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES feed_comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_feed_comments_post_id ON feed_comments(post_id);
CREATE INDEX idx_feed_comments_author_id ON feed_comments(author_id);
CREATE INDEX idx_feed_comments_parent_id ON feed_comments(parent_comment_id);
CREATE INDEX idx_feed_comments_created_at ON feed_comments(created_at DESC);
CREATE INDEX idx_feed_comments_post_created ON feed_comments(post_id, created_at DESC);

-- =============================================================================
-- COMMENT LIKES TABLE
-- =============================================================================

CREATE TABLE feed_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES feed_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES feed_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id) -- One like per user per comment
);

-- Indexes for comment likes
CREATE INDEX idx_feed_comment_likes_comment_id ON feed_comment_likes(comment_id);
CREATE INDEX idx_feed_comment_likes_user_id ON feed_comment_likes(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_comment_likes ENABLE ROW LEVEL SECURITY;

-- Feed Comments Policies
-- Anyone can read comments
CREATE POLICY "Anyone can read feed comments"
  ON feed_comments FOR SELECT
  USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments"
  ON feed_comments FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM feed_users
      WHERE feed_users.id = feed_comments.author_id
      AND (
        feed_users.auth_user_id = auth.uid()::text OR
        feed_users.is_anonymous = true
      )
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON feed_comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM feed_users
      WHERE feed_users.id = feed_comments.author_id
      AND feed_users.auth_user_id = auth.uid()::text
    )
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON feed_comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM feed_users
      WHERE feed_users.id = feed_comments.author_id
      AND feed_users.auth_user_id = auth.uid()::text
    )
  );

-- Comment Likes Policies
-- Anyone can read comment likes
CREATE POLICY "Anyone can read feed comment likes"
  ON feed_comment_likes FOR SELECT
  USING (true);

-- Users can like comments
CREATE POLICY "Users can like comments"
  ON feed_comment_likes FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM feed_users
      WHERE feed_users.id = feed_comment_likes.user_id
      AND (
        feed_users.auth_user_id = auth.uid()::text OR
        feed_users.is_anonymous = true
      )
    )
  );

-- Users can unlike comments
CREATE POLICY "Users can unlike comments"
  ON feed_comment_likes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM feed_users
      WHERE feed_users.id = feed_comment_likes.user_id
      AND (
        feed_users.auth_user_id = auth.uid()::text OR
        feed_users.is_anonymous = true
      )
    )
  );

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Update like_count on feed_comments when likes are added/removed
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_comments
    SET like_count = like_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_comments
    SET like_count = like_count - 1
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feed_comment_likes_update_count
  AFTER INSERT OR DELETE ON feed_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_like_count();

-- Update updated_at timestamp on feed_comments
CREATE OR REPLACE FUNCTION update_feed_comments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feed_comments_update_timestamp
  BEFORE UPDATE ON feed_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_comments_timestamp();

-- =============================================================================
-- ADD COMMENT COUNT TO FEED_POSTS
-- =============================================================================

-- Add comment_count column to feed_posts
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0;

-- Trigger to update comment count on posts
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_posts
    SET comment_count = comment_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_posts
    SET comment_count = comment_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feed_comments_update_post_count
  AFTER INSERT OR DELETE ON feed_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- =============================================================================
-- REALTIME PUBLICATION
-- =============================================================================

-- Enable Realtime for comments tables
ALTER PUBLICATION supabase_realtime ADD TABLE feed_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_comment_likes;
