-- Create prompt library and prompts tables for dynamic content management
-- Includes analytics columns for future A/B testing and performance tracking

-- =============================================================================
-- PROMPT TABLES
-- =============================================================================

-- Prompt libraries: Collections of themed prompts
CREATE TABLE prompt_libraries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prompts: Individual prompt texts
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id TEXT NOT NULL REFERENCES prompt_libraries(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  variant TEXT, -- For future A/B testing ("A", "B", "control", etc)
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Analytics columns (for future use)
  times_shown INTEGER NOT NULL DEFAULT 0,
  times_answered INTEGER NOT NULL DEFAULT 0,
  avg_answer_time_ms INTEGER, -- Average time to answer in milliseconds
  thumbs_up_count INTEGER NOT NULL DEFAULT 0,
  thumbs_down_count INTEGER NOT NULL DEFAULT 0
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_prompts_library_active ON prompts(library_id, is_active) WHERE is_active = true;
CREATE INDEX idx_prompts_performance ON prompts(library_id, times_shown, times_answered);
CREATE INDEX idx_prompt_libraries_active ON prompt_libraries(is_active, sort_order) WHERE is_active = true;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE prompt_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Everyone can read active libraries and prompts
CREATE POLICY "Anyone can read active prompt libraries"
  ON prompt_libraries FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can read active prompts"
  ON prompts FOR SELECT
  USING (is_active = true);

-- Only service role can insert/update/delete (managed by Edge Functions)
CREATE POLICY "Service role can manage prompt libraries"
  ON prompt_libraries FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage prompts"
  ON prompts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prompt_libraries_updated_at
  BEFORE UPDATE ON prompt_libraries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Insert prompt libraries
INSERT INTO prompt_libraries (id, name, emoji, description, sort_order) VALUES
  ('classic', 'Classic Crowd', '🔥', 'Lighthearted pop-culture roasts for any crowd.', 1),
  ('dangerfield', 'Modern Day Dangerfield', '👨', 'Dangerfield-themed prompts for Millennials and Gen Zers.', 2),
  ('bar', 'Bar Banter', '🍻', 'Prompt pack built for bar trivia nights and regulars.', 3),
  ('basic', 'Basic Prompts', '✨', 'A simple mix of easygoing prompts for any crowd.', 4),
  ('halloween', 'Spooky Season', '🎃', 'Creepy, kooky, and perfect for costume parties.', 5),
  ('selfie', 'Selfie Stars', '📸', 'Creative selfie challenges for social-ready crowds.', 6),
  ('victoria', 'Victoria Nights', '🌊', 'Local flavor tailored for Victoria, BC crowds.', 7);

-- Insert Classic Crowd prompts
INSERT INTO prompts (library_id, text, sort_order) VALUES
  ('classic', 'What would you say if an alien landed in your backyard?', 1),
  ('classic', 'What is the quickest way to get fired from your job?', 2),
  ('classic', 'If you were to start a sports team, what would the mascot be?', 3),
  ('classic', 'What is the worst theme for a children''s birthday party?', 4),
  ('classic', 'What would be the worst thing to hear from your doctor?', 5),
  ('classic', 'What is the most useless superpower you can think of?', 6),
  ('classic', 'If animals could talk, which one would be the rudest?', 7),
  ('classic', 'Pitch a new reality show that would get canceled immediately.', 8),
  ('classic', 'Name a terrible new cocktail people would still order.', 9),
  ('classic', 'Rename a classic drink to fit its true personality.', 10),
  ('classic', 'Write a pickup line one bar item would use on another.', 11),
  ('classic', 'What''s the worst thing to say at a funeral?', 12),
  ('classic', 'If you had to rename a popular app, what would you call it?', 13),
  ('classic', 'What''s the most embarrassing thing to happen at a job interview?', 14),
  ('classic', 'If you could make one law that everyone had to follow, what would it be?', 15),
  ('classic', 'What''s the worst superpower to have at a party?', 16),
  ('classic', 'If you had to describe your last meal using only emojis, what would it be?', 17),
  ('classic', 'What''s the most ridiculous thing you could put on a resume?', 18),
  ('classic', 'If you could make any animal the size of a house, which would be the most terrifying?', 19),
  ('classic', 'What''s the most useless invention you can think of?', 20),
  ('classic', 'If you could be any kitchen appliance, which one would you be?', 21),
  ('classic', 'What''s the weirdest thing you could find in someone''s fridge?', 22),
  ('classic', 'If you had to replace your hands with any utensils, what would they be?', 23),
  ('classic', 'What''s the most embarrassing thing to happen during a first date?', 24),
  ('classic', 'If you could time travel to any point in history, where would you go?', 25),
  ('classic', 'What''s the worst possible name for a band?', 26),
  ('classic', 'If you were a ghost, what would haunt?', 27),
  ('classic', 'What''s the most useless college major?', 28),
  ('classic', 'If you could have dinner with any fictional character, who would it be?', 29),
  ('classic', 'What''s the worst thing to find in your hotel room?', 30),
  ('classic', 'If you could swap lives with any celebrity for a day, who would it be?', 31),
  ('classic', 'What''s the most ridiculous thing you believed as a child?', 32),
  ('classic', 'If you were to create a new holiday, what would it be?', 33),
  ('classic', 'What''s the worst possible superpower to have?', 34),
  ('classic', 'If animals voted, which one would be president?', 35),
  ('classic', 'What''s the most embarrassing text you''ve ever sent?', 36),
  ('classic', 'If you could be any mythical creature, what would you be?', 37),
  ('classic', 'What''s the worst thing to hear from your boss?', 38),
  ('classic', 'If you had to eat one food for the rest of your life, what would it be?', 39),
  ('classic', 'What''s the most useless skill you possess?', 40),
  ('classic', 'If you could teleport anywhere right now, where would you go?', 41),
  ('classic', 'What''s the weirdest dream you''ve ever had?', 42),
  ('classic', 'If you were a superhero, what would your name be?', 43),
  ('classic', 'What''s the most ridiculous law you can think of?', 44),
  ('classic', 'If you could talk to your pet, what would they say?', 45);
