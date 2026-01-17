-- Add expires_at field to feed_users for anonymous user lifespan

-- Add expires_at column
ALTER TABLE feed_users ADD COLUMN expires_at TIMESTAMPTZ;

-- Update existing anonymous users to have expiration dates
-- Give them 24 hours from migration time
UPDATE feed_users
SET expires_at = NOW() + INTERVAL '24 hours'
WHERE is_anonymous = true AND expires_at IS NULL;

-- Add constraint to ensure anonymous users always have an expiration
ALTER TABLE feed_users
ADD CONSTRAINT check_anonymous_expiration
CHECK (
  (is_anonymous = false) OR
  (is_anonymous = true AND expires_at IS NOT NULL)
);

-- Create index for efficient cleanup queries
CREATE INDEX idx_feed_users_expires_at ON feed_users(expires_at) WHERE expires_at IS NOT NULL;

-- Create a function to clean up expired anonymous users
CREATE OR REPLACE FUNCTION cleanup_expired_anonymous_users()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM feed_users
  WHERE is_anonymous = true
    AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;