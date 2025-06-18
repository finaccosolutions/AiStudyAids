/*
  # Fix Competition RLS Policies

  1. Security Changes
    - Remove recursive policy that causes infinite loop
    - Simplify competition access policies
    - Ensure proper access control without circular references

  2. Policy Updates
    - Creators can manage their competitions
    - Users can view competitions they're participating in
    - Remove complex subquery that causes recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view public competitions" ON competitions;
DROP POLICY IF EXISTS "Creators can manage their competitions" ON competitions;

-- Create simplified, non-recursive policies
CREATE POLICY "Creators can manage their competitions"
  ON competitions
  FOR ALL
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can view competitions they participate in"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (
    creator_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 
      FROM competition_participants cp 
      WHERE cp.competition_id = competitions.id 
      AND cp.user_id = auth.uid()
      AND cp.status IN ('joined', 'completed', 'invited')
    )
  );