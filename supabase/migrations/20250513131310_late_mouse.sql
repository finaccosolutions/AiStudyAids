/*
  # Update question_banks table for previous year questions

  1. Changes
    - Add is_previous_year column to question_banks table
    - Add year_count column to question_banks table
    - Add essay type to question_types constraint
  
  2. Notes
    - Maintains existing data
    - Adds support for previous year questions
    - Updates question types validation
*/

-- Add new columns to question_banks table
ALTER TABLE question_banks
ADD COLUMN is_previous_year boolean DEFAULT false,
ADD COLUMN year_count integer;

-- Drop existing question_types constraint
ALTER TABLE question_banks 
DROP CONSTRAINT IF EXISTS quiz_preferences_question_types_check;

-- Update question_types constraint to include essay type
ALTER TABLE question_banks 
ADD CONSTRAINT question_types_check 
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
    'multi-select',
    'essay'
  ]::text[]
);

-- Add constraint for year_count
ALTER TABLE question_banks
ADD CONSTRAINT year_count_check
CHECK (
  (NOT is_previous_year) OR
  (year_count BETWEEN 1 AND 20)
);