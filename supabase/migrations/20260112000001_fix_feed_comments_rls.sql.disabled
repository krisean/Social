-- Fix RLS policies for feed_comments and feed_comment_likes after feed_users rename
-- These policies were still referencing the old 'feed_users' table name

-- =============================================================================
-- UPDATE FEED COMMENTS RLS POLICIES
-- =============================================================================

-- Drop existing policies that reference feed_users
DROP POLICY IF EXISTS "Users can create comments" ON feed_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON feed_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON feed_comments;

-- Recreate policies with correct 'users' table reference
CREATE POLICY "Users can create comments"
  ON feed_comments FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = feed_comments.author_id
      AND (
        users.auth_user_id = auth.uid()::text OR
        users.is_anonymous = true
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON feed_comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = feed_comments.author_id
      AND users.auth_user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own comments"
  ON feed_comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = feed_comments.author_id
      AND users.auth_user_id = auth.uid()::text
    )
  );

-- =============================================================================
-- UPDATE FEED COMMENT LIKES RLS POLICIES
-- =============================================================================

-- Drop existing policies that reference feed_users
DROP POLICY IF EXISTS "Users can like comments" ON feed_comment_likes;
DROP POLICY IF EXISTS "Users can unlike comments" ON feed_comment_likes;

-- Recreate policies with correct 'users' table reference
CREATE POLICY "Users can like comments"
  ON feed_comment_likes FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = feed_comment_likes.user_id
      AND (
        users.auth_user_id = auth.uid()::text OR
        users.is_anonymous = true
      )
    )
  );

CREATE POLICY "Users can unlike comments"
  ON feed_comment_likes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = feed_comment_likes.user_id
      AND (
        users.auth_user_id = auth.uid()::text OR
        users.is_anonymous = true
      )
    )
  );
