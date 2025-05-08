/*
  # Fix question types validation

  1. Changes
    - Drop existing question_types constraint
    - Update existing data to ensure valid question types
    - Add new constraint with proper validation
    - Ensure all question types are from allowed set
  
  2. Notes
    - Updates existing data before adding constraint
    - Maintains data integrity
    - Prevents invalid question types
*/

-- First, drop the existing constraint if it exists
ALTER TABLE quiz_preferences 
DROP CONSTRAINT IF EXISTS quiz_preferences_question_types_check;

-- Update any invalid question types to ensure they match the new constraint
UPDATE quiz_preferences 
SET question_types = ARRAY['multiple-choice']::text[]
WHERE NOT (question_types <@ ARRAY[
  'multiple-choice',
  'true-false',
  'fill-blank',
  'matching',
  'code-output',
  'assertion-reason'
]::text[])
OR question_types IS NULL 
OR array_length(question_types, 1) = 0;

-- Now add the new constraint
ALTER TABLE quiz_preferences 
ADD CONSTRAINT quiz_preferences_question_types_check 
CHECK (
  array_length(question_types, 1) > 0 AND
  array_length(question_types, 1) <= 6 AND
  question_types <@ ARRAY[
    'multiple-choice',
    'true-false',
    'fill-blank',
    'matching',
    'code-output',
    'assertion-reason'
  ]::text[]
);