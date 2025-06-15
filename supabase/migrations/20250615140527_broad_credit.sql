/*
  # Quiz Competition System

  1. New Tables
    - `competitions`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `competition_code` (text, unique)
      - `type` (text) - 'private' or 'random'
      - `status` (text) - 'waiting', 'active', 'completed'
      - `max_participants` (integer)
      - `quiz_preferences` (jsonb)
      - `questions` (jsonb)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `competition_participants`
      - `id` (uuid, primary key)
      - `competition_id` (uuid, references competitions)
      - `user_id` (uuid, references auth.users)
      - `email` (text)
      - `status` (text) - 'invited', 'joined', 'completed'
      - `score` (integer)
      - `correct_answers` (integer)
      - `time_taken` (integer)
      - `answers` (jsonb)
      - `rank` (integer)
      - `points_earned` (integer)
      - `joined_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `user_stats`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `total_competitions` (integer)
      - `wins` (integer)
      - `losses` (integer)
      - `draws` (integer)
      - `total_points` (integer)
      - `average_score` (numeric)
      - `best_rank` (integer)
      - `total_time_played` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `random_queue`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `topic` (text)
      - `difficulty` (text)
      - `language` (text)
      - `status` (text) - 'waiting', 'matched', 'cancelled'
      - `created_at` (timestamptz)
    
    - `competition_chat`
      - `id` (uuid, primary key)
      - `competition_id` (uuid, references competitions)
      - `user_id` (uuid, references auth.users)
      - `message` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text,
  competition_code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('private', 'random')),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  max_participants integer NOT NULL DEFAULT 10,
  quiz_preferences jsonb NOT NULL,
  questions jsonb,
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create competition_participants table
CREATE TABLE IF NOT EXISTS competition_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users,
  email text,
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'completed', 'declined')),
  score integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  time_taken integer DEFAULT 0,
  answers jsonb DEFAULT '{}',
  rank integer,
  points_earned integer DEFAULT 0,
  joined_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(competition_id, user_id),
  UNIQUE(competition_id, email)
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users UNIQUE NOT NULL,
  total_competitions integer DEFAULT 0,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  draws integer DEFAULT 0,
  total_points integer DEFAULT 0,
  average_score numeric DEFAULT 0,
  best_rank integer,
  total_time_played integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create random_queue table
CREATE TABLE IF NOT EXISTS random_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language text NOT NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create competition_chat table
CREATE TABLE IF NOT EXISTS competition_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE random_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_chat ENABLE ROW LEVEL SECURITY;

-- RLS Policies for competitions
CREATE POLICY "Users can view competitions they're involved in"
  ON competitions FOR SELECT
  TO authenticated
  USING (
    creator_id = auth.uid() OR
    id IN (
      SELECT competition_id FROM competition_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create competitions"
  ON competitions FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their competitions"
  ON competitions FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- RLS Policies for competition_participants
CREATE POLICY "Users can view participants in their competitions"
  ON competition_participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    competition_id IN (
      SELECT id FROM competitions WHERE creator_id = auth.uid()
    ) OR
    competition_id IN (
      SELECT competition_id FROM competition_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join competitions"
  ON competition_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their participation"
  ON competition_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_stats
CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for random_queue
CREATE POLICY "Users can manage their queue entries"
  ON random_queue FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for competition_chat
CREATE POLICY "Users can view chat in their competitions"
  ON competition_chat FOR SELECT
  TO authenticated
  USING (
    competition_id IN (
      SELECT id FROM competitions WHERE creator_id = auth.uid()
    ) OR
    competition_id IN (
      SELECT competition_id FROM competition_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their competitions"
  ON competition_chat FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    competition_id IN (
      SELECT id FROM competitions WHERE creator_id = auth.uid()
    ) OR
    competition_id IN (
      SELECT competition_id FROM competition_participants WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS competitions_creator_id_idx ON competitions (creator_id);
CREATE INDEX IF NOT EXISTS competitions_code_idx ON competitions (competition_code);
CREATE INDEX IF NOT EXISTS competitions_status_idx ON competitions (status);
CREATE INDEX IF NOT EXISTS competition_participants_competition_id_idx ON competition_participants (competition_id);
CREATE INDEX IF NOT EXISTS competition_participants_user_id_idx ON competition_participants (user_id);
CREATE INDEX IF NOT EXISTS user_stats_user_id_idx ON user_stats (user_id);
CREATE INDEX IF NOT EXISTS random_queue_topic_difficulty_idx ON random_queue (topic, difficulty, status);
CREATE INDEX IF NOT EXISTS competition_chat_competition_id_idx ON competition_chat (competition_id);

-- Function to generate unique competition code
CREATE OR REPLACE FUNCTION generate_competition_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    SELECT EXISTS(SELECT 1 FROM competitions WHERE competition_code = code) INTO exists;
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update competition timestamps
CREATE OR REPLACE FUNCTION handle_competition_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats timestamps
CREATE OR REPLACE FUNCTION handle_user_stats_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER competition_updated
  BEFORE UPDATE ON competitions
  FOR EACH ROW
  EXECUTE FUNCTION handle_competition_updated();

CREATE TRIGGER user_stats_updated
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_stats_updated();