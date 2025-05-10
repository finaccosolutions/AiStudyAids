/*
  # Fix Profiles Table RLS Policies

  1. Changes
    - Remove existing RLS policies for profiles table
    - Add new policies that properly handle:
      - Initial profile creation during signup
      - Profile management for authenticated users
      - Profile viewing permissions
  
  2. Security
    - Ensures users can only manage their own profile
    - Allows initial profile creation during signup
    - Maintains data isolation between users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users only" 
ON public.profiles
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable select for users based on user_id" 
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" 
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" 
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);