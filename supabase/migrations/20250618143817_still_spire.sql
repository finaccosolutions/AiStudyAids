/*
  # Fix Competition RLS Policy Infinite Recursion

  1. Policy Changes
    - Remove the problematic "Participants can view joined competitions" policy that causes circular dependency
    - Simplify the policy to avoid self-referencing the competitions table
    - Keep other policies intact for proper security

  2. Security
    - Maintain proper access control for competition creators
    - Allow participants to view competitions they've joined without circular references
    - Ensure users can only create competitions for themselves
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Participants can view joined competitions" ON competitions;

-- Create a simpler policy that doesn't cause circular dependency
-- This policy allows users to view competitions where they are participants
-- without creating a circular reference
CREATE POLICY "Users can view competitions they participate in"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (
    creator_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM competition_participants cp 
      WHERE cp.competition_id = competitions.id 
      AND cp.user_id = auth.uid() 
      AND cp.status IN ('joined', 'completed')
    )
  );