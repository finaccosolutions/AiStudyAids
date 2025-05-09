/*
  # Remove email_confirmed from profiles table
  
  1. Changes
    - Remove email_confirmed column from profiles table
    - Email verification will now be handled by auth.users table
  
  2. Notes
    - This is a non-destructive change
    - Email verification status is managed by Supabase Auth
*/

ALTER TABLE profiles
DROP COLUMN IF EXISTS email_confirmed;