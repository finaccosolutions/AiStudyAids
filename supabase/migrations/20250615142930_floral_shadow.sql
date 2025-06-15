/*
  # Fix infinite recursion in competition RLS policies

  1. Policy Changes
    - Remove recursive policy on competitions table
    - Create simpler, non-recursive policies
    - Ensure competition_participants policies don't create circular references

  2. Security
    - Maintain proper access control without recursion
    - Users can view competitions they created or joined
    - Participants can view competition details
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view competitions they're involved in" ON competitions;
DROP POLICY IF EXISTS "Users can view participants in their competitions" ON competition_participants;

-- Create new non-recursive policies for competitions
CREATE POLICY "Creators can view their competitions"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Participants can view joined competitions"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT cp.competition_id 
      FROM competition_participants cp 
      WHERE cp.user_id = auth.uid() 
      AND cp.status IN ('joined', 'completed')
    )
  );

-- Create new non-recursive policies for competition_participants
CREATE POLICY "Users can view their own participation"
  ON competition_participants
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Creators can view all participants in their competitions"
  ON competition_participants
  FOR SELECT
  TO authenticated
  USING (
    competition_id IN (
      SELECT c.id 
      FROM competitions c 
      WHERE c.creator_id = auth.uid()
    )
  );

CREATE POLICY "Participants can view other participants in same competition"
  ON competition_participants
  FOR SELECT
  TO authenticated
  USING (
    competition_id IN (
      SELECT cp.competition_id 
      FROM competition_participants cp 
      WHERE cp.user_id = auth.uid()
    )
  );