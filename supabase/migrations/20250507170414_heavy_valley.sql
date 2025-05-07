/*
  # Add new fields to quiz preferences table

  1. Changes
    - Add new columns to `quiz_preferences` table:
      - `subtopic` (text, nullable)
      - `difficulty` (text, default: 'medium')
      - `time_limit` (integer, default: 30)
      - `negative_marking` (boolean, default: false)
      - `negative_marks` (integer, default: 0)
      - `mode` (text, default: 'practice')
      - `answer_mode` (text, default: 'single')

  2. Notes
    - All new columns have appropriate default values
    - Existing rows will use default values for new columns
*/

DO $$ 
BEGIN
  -- Add subtopic column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_preferences' AND column_name = 'subtopic'
  ) THEN
    ALTER TABLE quiz_preferences ADD COLUMN subtopic text;
  END IF;

  -- Add difficulty column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_preferences' AND column_name = 'difficulty'
  ) THEN
    ALTER TABLE quiz_preferences ADD COLUMN difficulty text DEFAULT 'medium';
  END IF;

  -- Add time_limit column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_preferences' AND column_name = 'time_limit'
  ) THEN
    ALTER TABLE quiz_preferences ADD COLUMN time_limit integer DEFAULT 30;
  END IF;

  -- Add negative_marking column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_preferences' AND column_name = 'negative_marking'
  ) THEN
    ALTER TABLE quiz_preferences ADD COLUMN negative_marking boolean DEFAULT false;
  END IF;

  -- Add negative_marks column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_preferences' AND column_name = 'negative_marks'
  ) THEN
    ALTER TABLE quiz_preferences ADD COLUMN negative_marks integer DEFAULT 0;
  END IF;

  -- Add mode column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_preferences' AND column_name = 'mode'
  ) THEN
    ALTER TABLE quiz_preferences ADD COLUMN mode text DEFAULT 'practice';
  END IF;

  -- Add answer_mode column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_preferences' AND column_name = 'answer_mode'
  ) THEN
    ALTER TABLE quiz_preferences ADD COLUMN answer_mode text DEFAULT 'single';
  END IF;
END $$;