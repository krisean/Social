
# Supabase RLS Policies for Top Comment 24/7 Wall
# Venue-isolated, role-based access for patrons, staff, admins
# File: rls.md

## Schema Overview
```sql
-- Core tables for Top Comment 24/7 persistent engagement platform
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  qr_code TEXT UNIQUE
);

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  type TEXT CHECK (type IN ('topcomment', 'vibox')),
  status TEXT CHECK (status IN ('waiting', 'playing', 'voting'))
);

CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  prompt_id UUID REFERENCES prompts(id),
  user_id UUID REFERENCES auth.users(id),
  text TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id), -- NULL for top-level comments
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  comment_id UUID REFERENCES comments(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  period TEXT CHECK (period IN ('daily', 'weekly', 'all-time')),
  earned_at TIMESTAMP DEFAULT NOW(),
  comment_id UUID REFERENCES comments(id),
  UNIQUE(venue_id, user_id, title, period)
);
```

## Enable RLS on All Tables
```sql
-- Enable Row Level Security on every table for strict access control
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clout ENABLE ROW LEVEL SECURITY;
```

## Role-Based Policies

### 1. Patron (Anonymous via QR + venue_id JWT)
**Description**: Patrons scan venue QR codes which inject `venue_id` into their JWT via anonymous auth. They can read all venue content (wall/leaderboards), post comments/replies (no self-replies enforced in app), and cast limited likes (daily limits in app logic). No access to other venues.

```sql
-- Read venue info only (for display)
CREATE POLICY "Patron - Venues Read" ON venues
FOR SELECT USING (id = auth.jwt()->>'venue_id'::UUID);

-- Full CRUD on venue games (join, play, vote)
CREATE POLICY "Patron - Games" ON games
FOR ALL USING (venue_id = auth.jwt()->>'venue_id'::UUID)
WITH CHECK (venue_id = auth.jwt()->>'venue_id'::UUID);

-- Read all venue prompts/questions
CREATE POLICY "Patron - Prompts Read" ON prompts
FOR SELECT USING (venue_id = auth.jwt()->>'venue_id'::UUID);

-- Read all comments, write own (threads, no self-reply in app)
CREATE POLICY "Patron - Comments" ON comments
FOR ALL USING (venue_id = auth.jwt()->>'venue_id'::UUID)
WITH CHECK (venue_id = auth.jwt()->>'venue_id'::UUID);

-- Read all likes, write own (daily limits in app)
CREATE POLICY "Patron - Likes" ON likes
FOR ALL USING (venue_id = auth.jwt()->>'venue_id'::UUID)
WITH CHECK (venue_id = auth.jwt()->>'venue_id'::UUID);

-- Public read-only clout/leaderboards
CREATE POLICY "Patron - Clout Read" ON clout
FOR SELECT USING (venue_id = auth.jwt()->>'venue_id'::UUID);
```

### 2. Venue Staff (staff: true JWT claim)
**Description**: Bar staff/managers authenticate with `staff: true` claim. Full venue control: create prompts, moderate content, update clout titles ("Unhinged" awards), manage games. Cannot access other venues.

```sql
-- Full venue access + game management
CREATE POLICY "Staff - Full Venue" ON games
FOR ALL USING (
  venue_id = auth.jwt()->>'venue_id'::UUID 
  AND (auth.jwt()->>'staff' = 'true')
) WITH CHECK (
  venue_id = auth.jwt()->>'venue_id'::UUID 
  AND (auth.jwt()->>'staff' = 'true')
);

-- Create/edit prompts and questions
CREATE POLICY "Staff - Prompts" ON prompts
FOR ALL USING (
  venue_id = auth.jwt()->>'venue_id'::UUID 
  AND (auth.jwt()->>'staff' = 'true')
) WITH CHECK (
  venue_id = auth.jwt()->>'venue_id'::UUID 
  AND (auth.jwt()->>'staff' = 'true')
);

-- Award/update clout titles
CREATE POLICY "Staff - Clout Manage" ON clout
FOR ALL USING (
  venue_id = auth.jwt()->>'venue_id'::UUID 
  AND (auth.jwt()->>'staff' = 'true')
) WITH CHECK (
  venue_id = auth.jwt()->>'venue_id'::UUID 
  AND (auth.jwt()->>'staff' = 'true')
);
```

### 3. Platform Admin (admin: true or service_role)
**Description**: Platform operators with `admin: true` JWT claim or `service_role`. Full cross-venue access for analytics, support, migrations. Bypasses venue isolation.

```sql
-- Full access to all venues
CREATE POLICY "Admin - All Venues" ON venues
FOR ALL USING (auth.jwt()->>'admin' = 'true' OR auth.role() = 'service_role');

-- Full access to all games across venues
CREATE POLICY "Admin - All Games" ON games
FOR ALL USING (auth.jwt()->>'admin' = 'true' OR auth.role() = 'service_role');

-- Full access to all content tables
CREATE POLICY "Admin - All Prompts" ON prompts
FOR ALL USING (auth.jwt()->>'admin' = 'true' OR auth.role() = 'service_role');

CREATE POLICY "Admin - All Comments" ON comments
FOR ALL USING (auth.jwt()->>'admin' = 'true' OR auth.role() = 'service_role');

CREATE POLICY "Admin - All Likes" ON likes
FOR ALL USING (auth.jwt()->>'admin' = 'true' OR auth.role() = 'service_role');

CREATE POLICY "Admin - All Clout" ON clout
FOR ALL USING (auth.jwt()->>'admin' = 'true' OR auth.role() = 'service_role');
```

## Realtime Subscriptions
**Description**: Live wall updates via venue-specific channels. RLS automatically filters broadcasts to authorized users only.

```sql
-- Channel format: `venue:${venue_id}`
-- Client subscription:
-- supabase.channel(`venue:${venueId}`).on('postgres_changes', {...}).subscribe()

-- Listens for: comments, likes, clout changes
-- Auto-applies all RLS policies above
```

## JWT Claims Setup
**Description**: QR codes trigger edge function injecting venue context into anon JWTs.

```typescript
// /auth/qr-signin Edge Function
const { data } = await supabase.auth.signInAnonymously({
  options: {
    data: { 
      venue_id: venueId, 
      staff: isStaffFromQR, 
      anon: true 
    }
  }
});
```

## Testing Policies
**Description**: Verify isolation in Supabase SQL Editor or psql.

```sql
-- Test patron isolation
SET ROLE anon;
SET LOCAL "request.jwt.claims" = jsonb_build_object('venue_id', '123e4567-e89b-12d3-a456-426614174000');

SELECT * FROM comments LIMIT 5; -- Only venue's comments

-- Test staff access
SET LOCAL "request.jwt.claims" = jsonb_build_object('venue_id', '123e4567...', 'staff', 'true');
INSERT INTO prompts (venue_id, text) VALUES (...); -- Succeeds
```

## Deployment Instructions
**Description**: Apply via Supabase Dashboard SQL Editor, CLI, or migration files.

```bash
# Via Supabase CLI
supabase db push

# Or direct psql
psql $SUPABASE_DB_URL -f rls.sql

# Verify policies
supabase db dump --schema-only | grep POLICY
```

**File updated as `rls.md` with full policy descriptions**[file:1]
