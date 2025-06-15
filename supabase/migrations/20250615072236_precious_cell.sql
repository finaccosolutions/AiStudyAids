/*
  # Fix answer_evaluations table constraints

  1. Changes
    - Make answer_sheet_url column nullable to support generate/custom modes
    - Make question_paper_id column nullable as it's not always needed
  
  2. Security
    - Maintains existing RLS policies
*/

-- Make answer_sheet_url nullable to support generate/custom modes
ALTER TABLE answer_evaluations 
ALTER COLUMN answer_sheet_url DROP NOT NULL;

-- Make question_paper_id nullable as it's optional
ALTER TABLE answer_evaluations 
ALTER COLUMN question_paper_id DROP NOT NULL;