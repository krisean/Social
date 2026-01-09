-- Enable REPLICA IDENTITY FULL for realtime DELETE events
-- This allows Supabase Realtime to send the full row data when a row is deleted
-- Without this, DELETE events don't include enough information for the subscription

ALTER TABLE teams REPLICA IDENTITY FULL;
ALTER TABLE answers REPLICA IDENTITY FULL;
ALTER TABLE votes REPLICA IDENTITY FULL;
ALTER TABLE sessions REPLICA IDENTITY FULL;
