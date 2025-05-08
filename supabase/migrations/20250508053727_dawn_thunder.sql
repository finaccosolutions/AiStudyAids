/*
  # Fix question types validation and update handling

  1. Changes
    - Drop existing question_types constraint
    - Add new constraint with correct validation
    - Update existing data to ensure valid question types
  
  2. Notes
    - Ensures question_types array contains only valid values
    - Maintains array length requirements
*/

DO $$ 
BEGIN
  -- First, drop the existing constraint if it exists
  ALTER TABLE quiz_preferences 
  DROP CONSTRAINT IF EXISTS quiz_preferences_question_types_check;

  -- Update any invalid data
  UPDATE quiz_preferences 
  SET question_types = ARRAY['multiple-choice']
  WHERE question_types IS NULL OR array_length(question_types, 1) = 0;

  -- Add new constraint with proper validation
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
END $$;