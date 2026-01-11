-- Disable Row Level Security for vibox_queue table
-- This removes all RLS policies and disables RLS entirely

-- Drop all RLS policies for vibox_queue
DROP POLICY IF EXISTS "Anyone can view queue" ON vibox_queue;
DROP POLICY IF EXISTS "Anyone can add to queue" ON vibox_queue;
DROP POLICY IF EXISTS "Anyone can update queue" ON vibox_queue;
DROP POLICY IF EXISTS "Anyone can delete from queue" ON vibox_queue;

-- Disable Row Level Security entirely
ALTER TABLE vibox_queue DISABLE ROW LEVEL SECURITY;
