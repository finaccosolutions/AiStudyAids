/*
  # Add constraints to quiz preferences table

  1. Changes
    - Update existing data to match new constraints
    - Add constraints for mode values
    - Add constraints for answer_mode values
    - Add constraints for negative marks range
    - Add constraints for question count range
    - Add constraints for question_types array
    - Add constraints for difficulty values

  2. Notes
    - First updates existing data to valid values
    - Then adds constraints to ensure data integrity
*/

DO $$ 
BEGIN
  -- Update existing data to match new constraints
  UPDATE quiz_preferences 
  SET mode = 'practice' 
  WHERE mode NOT IN ('practice', 'exam');

  UPDATE quiz_preferences 
  SET answer_mode = 'immediate' 
  WHERE answer_mode NOT IN ('immediate', 'end');

  UPDATE quiz_preferences 
  SET negative_marks = 0 
  WHERE negative_marks < -5 OR negative_marks > 0;

  UPDATE quiz_preferences 
  SET question_count = GREATEST(1, LEAST(question_count, 50)) 
  WHERE question_count < 1 OR question_count > 50;

  UPDATE quiz_preferences 
  SET difficulty = 'medium' 
  WHERE difficulty NOT IN ('easy', 'medium', 'hard');

  -- Now add the constraints
  ALTER TABLE quiz_preferences 
  ADD CONSTRAINT quiz_preferences_mode_check 
  CHECK (mode IN ('practice', 'exam'));

  ALTER TABLE quiz_preferences 
  ADD CONSTRAINT quiz_preferences_answer_mode_check 
  CHECK (answer_mode IN ('immediate', 'end'));

  ALTER TABLE quiz_preferences 
  ADD CONSTRAINT quiz_preferences_negative_marks_check 
  CHECK (negative_marks >= -5 AND negative_marks <= 0);

  ALTER TABLE quiz_preferences 
  ADD CONSTRAINT quiz_preferences_question_count_check 
  CHECK (question_count >= 1 AND question_count <= 50);

  ALTER TABLE quiz_preferences 
  ADD CONSTRAINT quiz_preferences_question_types_check 
  CHECK (
    array_length(question_types, 1) > 0 AND
    array_length(question_types, 1) <= 6
  );

  ALTER TABLE quiz_preferences 
  ADD CONSTRAINT quiz_preferences_difficulty_check 
  CHECK (difficulty IN ('easy', 'medium', 'hard'));
END $$;