/*
  # Simplify quiz timing system

  1. Changes
    - Remove custom time limit columns
    - Update time_limit to be numeric
    - Update total_time_limit to be numeric
    - Drop old constraints
    - Add new constraints for time limits
  
  2. Notes
    - Simplifies timing system to use direct numeric values
    - Maintains data integrity with appropriate constraints
*/

-- First convert existing time values to numeric where possible
UPDATE quiz_preferences
SET time_limit = CASE
  WHEN time_limit ~ '^[0-9]+$' THEN time_limit::integer
  WHEN time_limit = 'custom' AND custom_time_limit IS NOT NULL THEN custom_time_limit
  ELSE NULL
END::text;

UPDATE quiz_preferences
SET total_time_limit = CASE
  WHEN total_time_limit ~ '^[0-9]+$' THEN total_time_limit::integer
  WHEN total_time_limit = 'custom' AND custom_total_time_limit IS NOT NULL THEN custom_total_time_limit
  ELSE NULL
END::text;

-- Drop old constraints and columns
ALTER TABLE quiz_preferences
DROP CONSTRAINT IF EXISTS time_limit_check,
DROP CONSTRAINT IF EXISTS total_time_limit_check,
DROP CONSTRAINT IF EXISTS custom_time_limit_check,
DROP CONSTRAINT IF EXISTS custom_total_time_limit_check;

ALTER TABLE quiz_preferences
DROP COLUMN IF EXISTS custom_time_limit,
DROP COLUMN IF EXISTS custom_total_time_limit;

-- Add new constraints
ALTER TABLE quiz_preferences
ADD CONSTRAINT time_limit_check
CHECK (
  time_limit IS NULL OR
  time_limit::integer BETWEEN 1 AND 3600
);

ALTER TABLE quiz_preferences
ADD CONSTRAINT total_time_limit_check
CHECK (
  total_time_limit IS NULL OR
  total_time_limit::integer BETWEEN 1 AND 3600
);