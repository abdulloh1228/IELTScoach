/*
  # Create listening exam module tables

  1. New Tables
    - `listening_tests`
      - `id` (uuid, primary key)
      - `title` (text) - test name
      - `audio_url` (text) - path to audio file in storage
      - `created_at` (timestamp)
    
    - `listening_questions`
      - `id` (uuid, primary key)
      - `test_id` (uuid, foreign key to listening_tests)
      - `question_number` (integer) - question order
      - `question_text` (text) - question content
      - `created_at` (timestamp)
    
    - `listening_answers`
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key to listening_questions)
      - `correct_answer` (text) - correct answer
      - `created_at` (timestamp)
    
    - `user_listening_answers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `question_id` (uuid, foreign key to listening_questions)
      - `user_answer` (text) - user's answer
      - `created_at` (timestamp)
    
    - `listening_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `test_id` (uuid, foreign key to listening_tests)
      - `score` (integer) - raw score (0-40)
      - `band_score` (numeric) - IELTS band (0-9)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can view results for their own attempts
    - Only authenticated users can submit answers
    - Admins can manage test data (for now allow all to read tests)

  3. Indexes
    - Index on test_id for fast question lookup
    - Index on user_id for result history
*/

-- listening_tests table
CREATE TABLE IF NOT EXISTS listening_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  audio_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- listening_questions table
CREATE TABLE IF NOT EXISTS listening_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES listening_tests(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- listening_answers table (correct answers)
CREATE TABLE IF NOT EXISTS listening_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES listening_questions(id) ON DELETE CASCADE,
  correct_answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- user_listening_answers table (user submissions)
CREATE TABLE IF NOT EXISTS user_listening_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES listening_questions(id) ON DELETE CASCADE,
  user_answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- listening_results table (test results)
CREATE TABLE IF NOT EXISTS listening_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES listening_tests(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  band_score numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE listening_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_listening_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listening_tests (read-only for authenticated users)
CREATE POLICY "Authenticated users can view listening tests"
  ON listening_tests FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for listening_questions (read-only for authenticated users)
CREATE POLICY "Authenticated users can view listening questions"
  ON listening_questions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for listening_answers (read-only for authenticated users)
CREATE POLICY "Authenticated users can view listening answers"
  ON listening_answers FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_listening_answers
CREATE POLICY "Users can view own answers"
  ON user_listening_answers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own answers"
  ON user_listening_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for listening_results
CREATE POLICY "Users can view own results"
  ON listening_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results"
  ON listening_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_listening_questions_test_id ON listening_questions(test_id);
CREATE INDEX idx_listening_answers_question_id ON listening_answers(question_id);
CREATE INDEX idx_user_listening_answers_user_id ON user_listening_answers(user_id);
CREATE INDEX idx_user_listening_answers_question_id ON user_listening_answers(question_id);
CREATE INDEX idx_listening_results_user_id ON listening_results(user_id);
CREATE INDEX idx_listening_results_test_id ON listening_results(test_id);
