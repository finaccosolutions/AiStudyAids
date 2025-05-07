/*
  # Convert time_limit column from integer to text

  1. Changes
    - Alter time_limit column type from integer to text
    - Add check constraint to ensure valid values
    - Handle existing data conversion

  2. Notes
    - Allows 'none' as a valid value
    - Maintains numeric string values for existing data
    - Ensures data integrity with check constraint
*/

-- First create a temporary column to hold the converted values
ALTER TABLE quiz_preferences 
ADD COLUMN time_limit_new text;

-- Copy existing data with conversion
UPDATE quiz_preferences 
SET time_limit_new = time_limit::text;

-- Drop the old column
ALTER TABLE quiz_preferences 
DROP COLUMN time_limit;

-- Rename the new column to time_limit
ALTER TABLE quiz_preferences 
RENAME COLUMN time_limit_new TO time_limit;

-- Add check constraint to ensure valid values
ALTER TABLE quiz_preferences 
ADD CONSTRAINT time_limit_check 
CHECK (
  time_limit IS NULL OR 
  time_limit = 'none' OR 
  time_limit ~ '^[0-9]+$'
);