-- Update the valid_status check constraint to include 'category-select'
-- This allows jeopardy mode to use the category selection phase

-- Drop the old constraint
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS valid_status;

-- Add the new constraint with 'category-select' included
ALTER TABLE sessions ADD CONSTRAINT valid_status 
  CHECK (status IN ('lobby', 'category-select', 'answer', 'vote', 'results', 'ended'));

-- Add comment for documentation
COMMENT ON CONSTRAINT valid_status ON sessions IS 'Valid session status values including category-select for jeopardy mode';
