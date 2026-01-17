-- Add pause functionality columns to sessions table
ALTER TABLE sessions
ADD COLUMN paused BOOLEAN DEFAULT FALSE,
ADD COLUMN paused_at TIMESTAMPTZ,
ADD COLUMN total_paused_ms INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN sessions.paused IS 'Whether the session timer is currently paused';
COMMENT ON COLUMN sessions.paused_at IS 'Timestamp when the session was last paused';
COMMENT ON COLUMN sessions.total_paused_ms IS 'Total milliseconds the session has been paused';