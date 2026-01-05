-- Add a test prompt library to verify database migration works
-- This creates a small library with just 5 prompts for testing

-- Insert test library
INSERT INTO prompt_libraries (id, name, emoji, description, sort_order) VALUES
  ('test', 'Test Library', '🧪', 'Testing database prompt loading', 8);

-- Insert test prompts
INSERT INTO prompts (library_id, text, sort_order) VALUES
  ('test', 'What''s your favorite color?', 1),
  ('test', 'If you could have any superpower, what would it be?', 2),
  ('test', 'What''s the best movie you''ve seen recently?', 3),
  ('test', 'If you could travel anywhere right now, where would you go?', 4),
  ('test', 'What''s your go-to comfort food?', 5);