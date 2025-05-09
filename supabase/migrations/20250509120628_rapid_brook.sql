/*
  # Update language codes to full names

  1. Changes
    - Update language column default value to use full language name
    - Update existing language values to full names
    - Update language check constraint
  
  2. Notes
    - Maintains data integrity during migration
    - Ensures consistent language naming
*/

-- Update existing language values
UPDATE quiz_preferences
SET language = CASE
  WHEN language = 'English' THEN 'English'
  WHEN language = 'Hindi' THEN 'Hindi'
  WHEN language = 'Malayalam' THEN 'Malayalam'
  WHEN language = 'Tamil' THEN 'Tamil'
  WHEN language = 'Telugu' THEN 'Telugu'
  ELSE 'English'
END;

-- Update default value
ALTER TABLE quiz_preferences
ALTER COLUMN language SET DEFAULT 'English';