/*
  # Add time limit enabled flag

  1. Changes
    - Add `time_limit_enabled` column to quiz_preferences table
    - Update existing constraints for time settings
    - Set default value to false for existing records
  
  2. Notes
    - Time settings only apply when time_limit_enabled is true
    - Maintains backwards compatibility
*/

ALTER TABLE quiz_preferences
ADD COLUMN time_limit_enabled boolean DEFAULT false;

-- Update existing constraints
ALTER TABLE quiz_preferences
DROP CONSTRAINT IF EXISTS time_limit_check,
DROP CONSTRAINT IF EXISTS total_time_limit_check;

ALTER TABLE quiz_preferences
ADD CONSTRAINT time_limit_check
CHECK (
  NOT time_limit_enabled OR
  time_limit IS NULL OR
  time_limit::integer BETWEEN 1 AND 3600
);

ALTER TABLE quiz_preferences
ADD CONSTRAINT total_time_limit_check
CHECK (
  NOT time_limit_enabled OR
  total_time_limit IS NULL OR
  total_time_limit::integer BETWEEN 1 AND 3600
);