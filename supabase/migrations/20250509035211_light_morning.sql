/*
  # Add User Profile and Authentication Enhancements

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `mobile_number` (text)
      - `email_confirmed` (boolean)
      - `avatar_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `quiz_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `quiz_date` (timestamptz)
      - `topic` (text)
      - `score` (integer)
      - `total_questions` (integer)
      - `time_taken` (integer)
      - `created_at` (timestamptz)
    
    - `favorite_questions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `question_text` (text)
      - `answer` (text)
      - `explanation` (text)
      - `topic` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
    - Add unique constraints and indexes
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text NOT NULL,
  mobile_number text NOT NULL,
  email_confirmed boolean DEFAULT false,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_profile UNIQUE (user_id),
  CONSTRAINT unique_mobile_number UNIQUE (mobile_number)
);

-- Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  quiz_date timestamptz DEFAULT now(),
  topic text NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  time_taken integer,
  created_at timestamptz DEFAULT now()
);

-- Create favorite_questions table
CREATE TABLE IF NOT EXISTS favorite_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  question_text text NOT NULL,
  answer text NOT NULL,
  explanation text,
  topic text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for quiz_results
CREATE POLICY "Users can view their own quiz results"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results"
  ON quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for favorite_questions
CREATE POLICY "Users can view their own favorite questions"
  ON favorite_questions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite questions"
  ON favorite_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite questions"
  ON favorite_questions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles (user_id);
CREATE INDEX IF NOT EXISTS quiz_results_user_id_idx ON quiz_results (user_id);
CREATE INDEX IF NOT EXISTS quiz_results_quiz_date_idx ON quiz_results (quiz_date);
CREATE INDEX IF NOT EXISTS favorite_questions_user_id_idx ON favorite_questions (user_id);
CREATE INDEX IF NOT EXISTS favorite_questions_topic_idx ON favorite_questions (topic);

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION handle_profile_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile updates
CREATE TRIGGER profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_updated();