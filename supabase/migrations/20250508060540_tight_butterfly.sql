/*
  # Update quiz preferences schema for improved settings

  1. Changes
    - Remove answer_mode column as it's redundant with mode
    - Update mode check constraint
    - Add custom time limit option
    - Update time limit check constraint
  
  2. Notes
    - Maintains existing data
    - Simplifies quiz mode options
    - Allows custom time limits
*/

DO $$ 
BEGIN
  -- First, drop the answer_mode column and its constraint
  ALTER TABLE quiz_preferences 
  DROP CONSTRAINT IF EXISTS quiz_preferences_answer_mode_check;
  
  ALTER TABLE quiz_preferences 
  DROP COLUMN IF EXISTS answer_mode;

  -- Update mode constraint
  ALTER TABLE quiz_preferences 
  DROP CONSTRAINT IF EXISTS quiz_preferences_mode_check;
  
  ALTER TABLE quiz_preferences 
  ADD CONSTRAINT quiz_preferences_mode_check 
  CHECK (mode IN ('practice', 'exam'));

  -- Update time_limit constraint to allow custom values
  ALTER TABLE quiz_preferences 
  DROP CONSTRAINT IF EXISTS time_limit_check;
  
  ALTER TABLE quiz_preferences 
  ADD CONSTRAINT time_limit_check 
  CHECK (
    time_limit IS NULL OR 
    time_limit = 'none' OR 
    time_limit = 'custom' OR
    time_limit ~ '^[0-9]+$'
  );

  -- Add custom_time_limit column for custom time values
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_preferences' AND column_name = 'custom_time_limit'
  ) THEN
    ALTER TABLE quiz_preferences 
    ADD COLUMN custom_time_limit integer;
  END IF;

  -- Add constraint for custom time limit range
  ALTER TABLE quiz_preferences 
  ADD CONSTRAINT custom_time_limit_check 
  CHECK (
    (time_limit != 'custom') OR 
    (custom_time_limit BETWEEN 1 AND 3600)
  );
END $$;