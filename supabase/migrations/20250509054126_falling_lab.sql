/*
  # Add email verification requirements

  1. Changes
    - Add helper function to check email verification status
    - Update RLS policies to require email verification
    - Ensure protected resources are only accessible to verified users
  
  2. Security
    - Email verification is required for most operations
    - Profile creation and viewing is allowed without verification
    - All other operations require verified email
*/

-- Helper function to check if a user's email is verified
CREATE OR REPLACE FUNCTION public.is_email_verified(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
    AND email_confirmed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for api_keys
DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
CREATE POLICY "Users can view their own API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND is_email_verified(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own API keys" ON api_keys;
CREATE POLICY "Users can insert their own API keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_email_verified(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own API keys" ON api_keys;
CREATE POLICY "Users can update their own API keys"
  ON api_keys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_email_verified(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND is_email_verified(auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own API keys" ON api_keys;
CREATE POLICY "Users can delete their own API keys"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_email_verified(auth.uid()));

-- Update RLS policies for quiz_preferences
DROP POLICY IF EXISTS "Users can view their own quiz preferences" ON quiz_preferences;
CREATE POLICY "Users can view their own quiz preferences"
  ON quiz_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND is_email_verified(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own quiz preferences" ON quiz_preferences;
CREATE POLICY "Users can insert their own quiz preferences"
  ON quiz_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_email_verified(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own quiz preferences" ON quiz_preferences;
CREATE POLICY "Users can update their own quiz preferences"
  ON quiz_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_email_verified(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND is_email_verified(auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own quiz preferences" ON quiz_preferences;
CREATE POLICY "Users can delete their own quiz preferences"
  ON quiz_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_email_verified(auth.uid()));

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_email_verified(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND is_email_verified(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update RLS policies for quiz_results
DROP POLICY IF EXISTS "Users can view their own quiz results" ON quiz_results;
CREATE POLICY "Users can view their own quiz results"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND is_email_verified(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own quiz results" ON quiz_results;
CREATE POLICY "Users can insert their own quiz results"
  ON quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_email_verified(auth.uid()));

-- Update RLS policies for favorite_questions
DROP POLICY IF EXISTS "Users can view their own favorite questions" ON favorite_questions;
CREATE POLICY "Users can view their own favorite questions"
  ON favorite_questions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND is_email_verified(auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own favorite questions" ON favorite_questions;
CREATE POLICY "Users can insert their own favorite questions"
  ON favorite_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_email_verified(auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own favorite questions" ON favorite_questions;
CREATE POLICY "Users can delete their own favorite questions"
  ON favorite_questions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_email_verified(auth.uid()));