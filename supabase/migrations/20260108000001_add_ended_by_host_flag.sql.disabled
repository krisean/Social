-- Add flag to track when host manually ends session
-- This allows us to distinguish between natural completion and premature ending

ALTER TABLE sessions ADD COLUMN ended_by_host BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN sessions.ended_by_host IS 'True if host clicked "End Session" button, false if session completed naturally';
