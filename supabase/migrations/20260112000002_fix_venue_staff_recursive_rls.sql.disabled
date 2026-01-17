-- Fix infinite recursion in venue_staff RLS policies
-- The policies were recursively checking themselves, causing infinite loops

-- =============================================================================
-- FIX VENUE_STAFF RLS POLICIES
-- =============================================================================

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Owners can see venue staff" ON venue_staff;
DROP POLICY IF EXISTS "Owners can manage venue staff" ON venue_staff;

-- Recreate policies without recursion
-- Owners can see all staff at their venues (non-recursive check)
CREATE POLICY "Owners can see venue staff"
  ON venue_staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM venue_staff vs2
      JOIN venue_accounts va ON va.id = vs2.venue_account_id
      WHERE va.auth_user_id = auth.uid()::text
      AND vs2.venue_id = venue_staff.venue_id
      AND vs2.role = 'owner'
      AND vs2.id != venue_staff.id  -- Prevent self-reference
    )
    OR
    -- Users can always see their own venue_staff records
    venue_account_id IN (
      SELECT id FROM venue_accounts WHERE auth_user_id = auth.uid()::text
    )
  );

-- Owners can manage staff at their venues (non-recursive check)
CREATE POLICY "Owners can manage venue staff"
  ON venue_staff FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM venue_staff vs2
      JOIN venue_accounts va ON va.id = vs2.venue_account_id
      WHERE va.auth_user_id = auth.uid()::text
      AND vs2.venue_id = venue_staff.venue_id
      AND vs2.role = 'owner'
      AND vs2.id != venue_staff.id  -- Prevent self-reference
    )
    OR
    -- Users can manage their own venue_staff records
    venue_account_id IN (
      SELECT id FROM venue_accounts WHERE auth_user_id = auth.uid()::text
    )
  );

-- =============================================================================
-- FIX FEED_POSTS POLICIES THAT REFERENCE VENUE_STAFF
-- =============================================================================

-- Drop the problematic policies that check venue_staff
DROP POLICY IF EXISTS "Venue staff can delete posts at their venue" ON feed_posts;
DROP POLICY IF EXISTS "Venue staff can moderate posts at their venue" ON feed_posts;

-- Recreate with SECURITY DEFINER functions to avoid recursion
CREATE OR REPLACE FUNCTION is_venue_staff_for_post(p_venue_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM venue_staff vs
    JOIN venue_accounts va ON va.id = vs.venue_account_id
    WHERE va.auth_user_id = auth.uid()::text
    AND vs.venue_id = p_venue_id
    AND va.is_active = true
    AND (vs.permissions->>'manage_posts')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Venue staff can delete posts at their venues (using function)
CREATE POLICY "Venue staff can delete posts at their venue"
  ON feed_posts FOR DELETE
  USING (is_venue_staff_for_post(venue_id));

-- Venue staff can update posts at their venues (using function)
CREATE POLICY "Venue staff can moderate posts at their venue"
  ON feed_posts FOR UPDATE
  USING (is_venue_staff_for_post(venue_id));

-- =============================================================================
-- FIX VENUES POLICIES THAT REFERENCE VENUE_STAFF
-- =============================================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Venue owners can update their venues" ON venues;

-- Recreate with SECURITY DEFINER function
CREATE OR REPLACE FUNCTION is_venue_owner(p_venue_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM venue_staff vs
    JOIN venue_accounts va ON va.id = vs.venue_account_id
    WHERE va.auth_user_id = auth.uid()::text
    AND vs.venue_id = p_venue_id
    AND vs.role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Venue owners can update their venues (using function)
CREATE POLICY "Venue owners can update their venues"
  ON venues FOR UPDATE
  USING (is_venue_owner(id));
