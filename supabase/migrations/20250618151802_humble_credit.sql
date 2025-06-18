/*
  # Fix Competition RLS Policies

  1. Security Changes
    - Drop existing problematic policies on competitions table
    - Create new simplified policies that avoid infinite recursion
    - Ensure creators can manage their competitions
    - Allow users to view competitions they participate in without circular references

  2. Policy Changes
    - Remove complex subquery that causes recursion
    - Simplify participant viewing logic
    - Maintain security while fixing the recursion issue
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Creators can manage their competitions" ON competitions;
DROP POLICY IF EXISTS "Users can view competitions they participate in" ON competitions;

-- Create new policies without recursion
CREATE POLICY "Creators can manage their competitions"
  ON competitions
  FOR ALL
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can view public competitions"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (
    creator_id = auth.uid() 
    OR 
    id IN (
      SELECT cp.competition_id 
      FROM competition_participants cp 
      WHERE cp.user_id = auth.uid() 
      AND cp.status IN ('joined', 'completed', 'invited')
    )
  );

-- Separate policy for participants to update their own participation
CREATE POLICY "Participants can view competition details"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM competition_participants cp 
      WHERE cp.competition_id = competitions.id 
      AND cp.user_id = auth.uid()
      AND cp.status IN ('joined', 'completed', 'invited')
    )
  );