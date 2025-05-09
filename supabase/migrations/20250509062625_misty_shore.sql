/*
  # Update profiles table RLS policies

  1. Changes
    - Drop existing policies
    - Create new policies with proper auth checks
    - Allow profile creation during registration
    - Require email verification for updates
  
  2. Security
    - Use auth.uid() instead of uid()
    - Maintain data access controls
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policies with proper auth checks
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND is_email_verified(auth.uid()))
WITH CHECK (auth.uid() = user_id AND is_email_verified(auth.uid()));

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);