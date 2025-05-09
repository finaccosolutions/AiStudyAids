/*
  # Update quiz preferences schema for comprehensive question types

  1. Changes
    - Update question_types constraint to include new question types
    - Ensure backward compatibility
    - Add validation for all question types
  
  2. Notes
    - Added new question types:
      - short-answer
      - sequence
      - case-study
      - situation
      - multi-select
    - Removed non-functional types:
      - matching
      - code-output
      - assertion-reason
*/

-- Drop existing constraint
ALTER TABLE quiz_preferences 
DROP CONSTRAINT IF EXISTS quiz_preferences_question_types_check;

-- Update any invalid data
UPDATE quiz_preferences 
SET question_types = ARRAY['multiple-choice']
WHERE NOT (question_types <@ ARRAY[
  'multiple-choice',
  'true-false',
  'fill-blank',
  'short-answer',
  'sequence',
  'case-study',
  'situation',
  'multi-select'
]::text[])
OR question_types IS NULL 
OR array_length(question_types, 1) = 0;

-- Add new constraint with updated question types
ALTER TABLE quiz_preferences 
ADD CONSTRAINT quiz_preferences_question_types_check 
CHECK (
  array_length(question_types, 1) > 0 AND
  array_length(question_types, 1) <= 8 AND
  question_types <@ ARRAY[
    'multiple-choice',
    'true-false',
    'fill-blank',
    'short-answer',
    'sequence',
    'case-study',
    'situation',
    'multi-select'
  ]::text[]
);