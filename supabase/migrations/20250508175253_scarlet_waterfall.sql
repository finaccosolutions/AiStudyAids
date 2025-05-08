/*
  # Add custom total time limit column

  1. Changes
    - Add `custom_total_time_limit` column to `quiz_preferences` table
      - Type: integer
      - Nullable: true
      - Constraint: Must be between 1 and 3600 seconds when time_limit is 'custom'
  
  2. Validation
    - Add check constraint to ensure valid values when used
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_preferences' 
    AND column_name = 'custom_total_time_limit'
  ) THEN
    ALTER TABLE quiz_preferences 
    ADD COLUMN custom_total_time_limit integer;

    ALTER TABLE quiz_preferences 
    ADD CONSTRAINT custom_total_time_limit_check 
    CHECK (
      (total_time_limit <> 'custom') OR 
      (custom_total_time_limit >= 1 AND custom_total_time_limit <= 3600)
    );
  END IF;
END $$;