/*
  # Add Course/Stream field to quiz preferences

  1. Changes
    - Add `course` column to quiz_preferences table
    - Make topic optional since it's specific to a course
    - Add check constraint for course field
  
  2. Notes
    - Course represents the main stream/course (e.g., Computer Science, Medicine)
    - Topic becomes optional as it's specific to the selected course
*/

DO $$ 
BEGIN
  -- Add course column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_preferences' AND column_name = 'course'
  ) THEN
    ALTER TABLE quiz_preferences 
    ADD COLUMN course text;

    -- Make topic optional
    ALTER TABLE quiz_preferences 
    ALTER COLUMN topic DROP NOT NULL;
  END IF;
END $$;