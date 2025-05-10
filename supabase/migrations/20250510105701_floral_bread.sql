/*
  # Fix profiles table RLS policies

  1. Changes
    - Drop existing RLS policies for profiles table
    - Create new, more secure RLS policies for profiles table
      - INSERT: Allow authenticated users to create their own profile
      - SELECT: Allow authenticated users to view their own profile
      - UPDATE: Allow authenticated users to update their own profile
      - DELETE: Allow authenticated users to delete their own profile
    
  2. Security
    - All policies now explicitly check for email verification
    - Added proper user_id validation against auth.uid()
    - Policies follow principle of least privilege
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Create new policies with proper checks
CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  is_email_verified(auth.uid())
);

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id AND
  is_email_verified(auth.uid())
);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE 
TO authenticated
USING (
  auth.uid() = user_id AND
  is_email_verified(auth.uid())
) WITH CHECK (
  auth.uid() = user_id AND
  is_email_verified(auth.uid())
);

CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE 
TO authenticated
USING (
  auth.uid() = user_id AND
  is_email_verified(auth.uid())
);