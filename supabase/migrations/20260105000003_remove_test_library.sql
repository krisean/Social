-- Remove the test library that was added for testing purposes

-- Delete test prompts first (foreign key constraint)
DELETE FROM prompts WHERE library_id = 'test';

-- Delete test library
DELETE FROM prompt_libraries WHERE id = 'test';