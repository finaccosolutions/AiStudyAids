/*
  # Add total quiz time settings

  1. Changes
    - Add `total_time_limit` column to quiz_preferences table
    - Add check constraint for total time limit values
    - Update existing constraints for time settings
  
  2. Notes
    - Allows storing both per-question and total quiz time preferences
    - Maintains data integrity with appropriate constraints
*/

DO $$ 
BEGIN
  -- Add total_time_limit column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_preferences' AND column_name = 'total_time_limit'
  ) THEN
    ALTER TABLE quiz_preferences 
    ADD COLUMN total_time_limit text;
  END IF;

  -- Update time_limit constraint to handle both modes
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

  -- Add constraint for total time limit
  ALTER TABLE quiz_preferences 
  ADD CONSTRAINT total_time_limit_check 
  CHECK (
    total_time_limit IS NULL OR 
    total_time_limit = 'none' OR 
    total_time_limit = 'custom' OR
    total_time_limit ~ '^[0-9]+$'
  );
END $$;