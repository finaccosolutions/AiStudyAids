/*
  # Add daily_hours column to study_plans table

  1. Changes
    - Add `daily_hours` column to `study_plans` table
    - Add constraint to ensure daily_hours is between 1 and 24

  2. Security
    - No changes to RLS policies needed
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'study_plans' 
    AND column_name = 'daily_hours'
  ) THEN
    ALTER TABLE study_plans 
    ADD COLUMN daily_hours integer NOT NULL;

    ALTER TABLE study_plans 
    ADD CONSTRAINT daily_hours_check 
    CHECK (daily_hours >= 1 AND daily_hours <= 24);
  END IF;
END $$;