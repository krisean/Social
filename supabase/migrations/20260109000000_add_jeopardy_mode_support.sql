-- Add jeopardy mode support to sessions table
-- This migration adds the category_grid column for tracking available/used categories in jeopardy mode

-- Add category_grid column to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS category_grid JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN sessions.category_grid IS 'Category grid for jeopardy mode - tracks available and used prompt library IDs';

-- Create index for better query performance on category_grid
CREATE INDEX IF NOT EXISTS idx_sessions_category_grid ON sessions USING GIN (category_grid);

-- Add comment explaining the structure
COMMENT ON INDEX idx_sessions_category_grid IS 'GIN index for efficient JSONB queries on category_grid';
