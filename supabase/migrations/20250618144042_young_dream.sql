/*
  # Fix Competition RLS Policies

  1. Security Changes
    - Drop existing problematic policies on competitions table
    - Create new, simplified policies that avoid recursion
    - Ensure proper access control without circular dependencies

  2. Policy Changes
    - Creators can manage their own competitions
    - Users can view competitions they are invited to or participating in
    - Simplified logic to prevent infinite recursion
*/

-- Drop all existing policies on competitions table
DROP POLICY IF EXISTS "Creators can update their competitions" ON competitions;
DROP POLICY IF EXISTS "Creators can view their competitions" ON competitions;
DROP POLICY IF EXISTS "Users can create competitions" ON competitions;
DROP POLICY IF EXISTS "Users can view competitions they participate in" ON competitions;

-- Create new simplified policies
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
      SELECT DISTINCT competition_id 
      FROM competition_participants 
      WHERE user_id = auth.uid() 
      AND status IN ('joined', 'completed', 'invited')
    )
  );

-- Also fix competition_participants policies to avoid recursion
DROP POLICY IF EXISTS "Users can view participants in their competitions" ON competition_participants;

CREATE POLICY "Users can view competition participants"
  ON competition_participants
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    competition_id IN (
      SELECT id FROM competitions WHERE creator_id = auth.uid()
    )
  );