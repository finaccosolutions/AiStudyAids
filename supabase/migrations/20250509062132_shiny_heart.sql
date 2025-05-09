/*
  # Update profiles table RLS policies

  1. Changes
    - Add RLS policy to allow new users to create their profile during signup
    - Modify existing policies to be more specific about conditions

  2. Security
    - Ensures users can only create their own profile
    - Maintains existing policies for profile updates and viewing
    - Adds specific checks for user_id matching
*/

-- Drop existing policies to recreate them with proper conditions
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policies with proper conditions
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);