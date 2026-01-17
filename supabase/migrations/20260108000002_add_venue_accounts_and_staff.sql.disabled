-- Add venue accounts and staff tables
-- Separate authentication system for bar owners and staff

-- =============================================================================
-- RENAME feed_users TO users (core user table for patrons)
-- =============================================================================

ALTER TABLE feed_users RENAME TO users;

-- Update indexes
ALTER INDEX idx_feed_users_auth_user_id RENAME TO idx_users_auth_user_id;
ALTER INDEX idx_feed_users_username RENAME TO idx_users_username;

-- Update foreign key references in feed_posts
ALTER TABLE feed_posts DROP CONSTRAINT feed_posts_author_id_fkey;
ALTER TABLE feed_posts ADD CONSTRAINT feed_posts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update foreign key references in feed_likes
ALTER TABLE feed_likes DROP CONSTRAINT feed_likes_user_id_fkey;
ALTER TABLE feed_likes ADD CONSTRAINT feed_likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update foreign key references in feed_comments (if exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'feed_comments'
  ) THEN
    ALTER TABLE feed_comments DROP CONSTRAINT IF EXISTS feed_comments_author_id_fkey;
    ALTER TABLE feed_comments ADD CONSTRAINT feed_comments_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =============================================================================
-- VENUE ACCOUNTS TABLE (Bar owners and staff)
-- =============================================================================

CREATE TABLE venue_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('bar_owner', 'staff')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- =============================================================================
-- VENUE STAFF TABLE (Links venue accounts to venues)
-- =============================================================================

CREATE TABLE venue_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_account_id UUID NOT NULL REFERENCES venue_accounts(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  permissions JSONB DEFAULT '{
    "manage_posts": true,
    "manage_events": true,
    "view_analytics": true,
    "manage_staff": false
  }'::jsonb,
  hired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(venue_account_id, venue_id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_venue_accounts_auth_user_id ON venue_accounts(auth_user_id);
CREATE INDEX idx_venue_accounts_role ON venue_accounts(role);
CREATE INDEX idx_venue_accounts_email ON venue_accounts(email);
CREATE INDEX idx_venue_staff_account ON venue_staff(venue_account_id);
CREATE INDEX idx_venue_staff_venue ON venue_staff(venue_id);
CREATE INDEX idx_venue_staff_role ON venue_staff(role);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE venue_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_staff ENABLE ROW LEVEL SECURITY;

-- Venue accounts can read their own profile
CREATE POLICY "Venue accounts can read their own profile"
  ON venue_accounts FOR SELECT
  USING (auth_user_id = auth.uid()::text);

-- Venue accounts can update their own profile
CREATE POLICY "Venue accounts can update their own profile"
  ON venue_accounts FOR UPDATE
  USING (auth_user_id = auth.uid()::text)
  WITH CHECK (auth_user_id = auth.uid()::text);

-- Bar owners can create staff accounts
CREATE POLICY "Bar owners can create staff accounts"
  ON venue_accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    role = 'staff' AND
    EXISTS (
      SELECT 1 FROM venue_accounts
      WHERE auth_user_id = auth.uid()::text
      AND role = 'bar_owner'
      AND is_active = true
    )
  );

-- Venue accounts can see their venue assignments
CREATE POLICY "Venue accounts can see their venues"
  ON venue_staff FOR SELECT
  USING (
    venue_account_id IN (
      SELECT id FROM venue_accounts WHERE auth_user_id = auth.uid()::text
    )
  );

-- Owners can see all staff at their venues
CREATE POLICY "Owners can see venue staff"
  ON venue_staff FOR SELECT
  USING (
    venue_id IN (
      SELECT vs.venue_id FROM venue_staff vs
      JOIN venue_accounts va ON va.id = vs.venue_account_id
      WHERE va.auth_user_id = auth.uid()::text
      AND vs.role = 'owner'
    )
  );

-- Owners can manage staff at their venues
CREATE POLICY "Owners can manage venue staff"
  ON venue_staff FOR ALL
  USING (
    venue_id IN (
      SELECT vs.venue_id FROM venue_staff vs
      JOIN venue_accounts va ON va.id = vs.venue_account_id
      WHERE va.auth_user_id = auth.uid()::text
      AND vs.role = 'owner'
    )
  );

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Check if user is a venue account (staff or owner)
CREATE OR REPLACE FUNCTION is_venue_account()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM venue_accounts
    WHERE auth_user_id = auth.uid()::text
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has permission at a specific venue
CREATE OR REPLACE FUNCTION has_venue_permission(
  p_venue_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM venue_staff vs
    JOIN venue_accounts va ON va.id = vs.venue_account_id
    WHERE va.auth_user_id = auth.uid()::text
    AND vs.venue_id = p_venue_id
    AND va.is_active = true
    AND (
      vs.role = 'owner' OR
      (vs.permissions->p_permission)::boolean = true
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's venue account role
CREATE OR REPLACE FUNCTION get_venue_account_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM venue_accounts
  WHERE auth_user_id = auth.uid()::text
  AND is_active = true;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- UPDATE EXISTING POLICIES FOR VENUE STAFF MODERATION
-- =============================================================================

-- Venue staff can delete posts at their venues
CREATE POLICY "Venue staff can delete posts at their venue"
  ON feed_posts FOR DELETE
  USING (
    venue_id IN (
      SELECT vs.venue_id
      FROM venue_staff vs
      JOIN venue_accounts va ON va.id = vs.venue_account_id
      WHERE va.auth_user_id = auth.uid()::text
      AND va.is_active = true
      AND (vs.permissions->>'manage_posts')::boolean = true
    )
  );

-- Venue staff can update posts at their venues (for moderation)
CREATE POLICY "Venue staff can moderate posts at their venue"
  ON feed_posts FOR UPDATE
  USING (
    venue_id IN (
      SELECT vs.venue_id
      FROM venue_staff vs
      JOIN venue_accounts va ON va.id = vs.venue_account_id
      WHERE va.auth_user_id = auth.uid()::text
      AND va.is_active = true
      AND (vs.permissions->>'manage_posts')::boolean = true
    )
  );

-- Venue owners can update their venues
CREATE POLICY "Venue owners can update their venues"
  ON venues FOR UPDATE
  USING (
    id IN (
      SELECT vs.venue_id
      FROM venue_staff vs
      JOIN venue_accounts va ON va.id = vs.venue_account_id
      WHERE va.auth_user_id = auth.uid()::text
      AND vs.role = 'owner'
    )
  );

-- =============================================================================
-- REALTIME PUBLICATION
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE venue_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE venue_staff;
