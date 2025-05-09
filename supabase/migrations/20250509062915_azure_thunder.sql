/*
  # Add insert policy for profiles table

  1. Changes
    - Add RLS policy to allow new users to insert their own profile during signup
    - This policy is critical for the signup flow to work correctly
    
  2. Security
    - Policy ensures users can only insert profiles with their own user_id
    - Maintains data integrity by preventing users from creating profiles for other users
*/

DO $$ 
BEGIN
  -- Drop existing policy if it exists to avoid conflicts
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    DROP POLICY "Users can insert their own profile" ON public.profiles;
  END IF;
END $$;

-- Create the insert policy
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);