/*
  # Complete IELTS Mock Test Platform Schema

  ## Overview
  This migration creates a comprehensive database schema for the MockExaminer IELTS test platform,
  supporting user management, test materials, progress tracking, and future AI scoring integration.

  ## 1. New Tables

  ### users (extends auth.users)
    - `id` (uuid, primary key) - links to auth.users
    - `email` (text, unique, not null)
    - `phone_number` (text)
    - `access_code` (text, unique) - generated access code for user
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### tests
    - `id` (uuid, primary key)
    - `title` (text, not null)
    - `test_type` (text, not null) - listening, writing, speaking, reading
    - `section` (text, not null) - practice or full_mock
    - `duration_minutes` (integer, not null) - test duration in minutes
    - `total_questions` (integer, default 0)
    - `description` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### questions
    - `id` (uuid, primary key)
    - `test_id` (uuid, references tests.id)
    - `question_text` (text, not null)
    - `question_type` (text, not null) - multiple_choice, short_answer, essay, fill_blank, matching
    - `image_url` (text) - Supabase storage URL for charts/diagrams
    - `audio_url` (text) - Supabase storage URL for listening audio
    - `order_number` (integer, not null)
    - `points` (integer, default 1)
    - `options` (jsonb) - for multiple choice questions
    - `created_at` (timestamptz)

  ### answers
    - `id` (uuid, primary key)
    - `question_id` (uuid, references questions.id)
    - `correct_answer` (text, not null)
    - `explanation` (text)
    - `created_at` (timestamptz)

  ### test_attempts
    - `id` (uuid, primary key)
    - `user_id` (uuid, references users.id)
    - `test_id` (uuid, references tests.id)
    - `score` (numeric) - raw score
    - `band_score` (numeric) - IELTS band score (0-9)
    - `time_spent` (integer) - seconds spent on test
    - `completion_status` (text, default 'in_progress') - in_progress, completed, abandoned
    - `ai_feedback` (jsonb) - structured AI feedback
    - `started_at` (timestamptz)
    - `completed_at` (timestamptz)
    - `created_at` (timestamptz)

  ### user_answers
    - `id` (uuid, primary key)
    - `attempt_id` (uuid, references test_attempts.id)
    - `question_id` (uuid, references questions.id)
    - `user_answer` (text)
    - `is_correct` (boolean)
    - `created_at` (timestamptz)

  ## 2. Security
    - Enable RLS on all tables
    - Users can only read their own data
    - Users can insert their own test attempts and answers
    - Public read access for tests and questions (test materials)

  ## 3. Indexes
    - Index on test_attempts(user_id, completed_at) for progress tracking
    - Index on questions(test_id, order_number) for efficient ordering
    - Index on user_answers(attempt_id) for fast answer retrieval

  ## 4. Functions
    - generate_access_code() - generates unique 8-character access code
    - update_updated_at_column() - trigger function for updated_at timestamps

  ## 5. Storage Buckets
    Storage buckets will be created separately for:
    - listening-audio
    - question-images
    - charts
    - reading-images
*/

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  phone_number text,
  access_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  test_type text NOT NULL CHECK (test_type IN ('listening', 'writing', 'speaking', 'reading')),
  section text NOT NULL CHECK (section IN ('practice', 'full_mock')),
  duration_minutes integer NOT NULL,
  total_questions integer DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer', 'essay', 'fill_blank', 'matching')),
  image_url text,
  audio_url text,
  order_number integer NOT NULL,
  points integer DEFAULT 1,
  options jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  correct_answer text NOT NULL,
  explanation text,
  created_at timestamptz DEFAULT now()
);

-- Create test_attempts table
CREATE TABLE IF NOT EXISTS test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  score numeric,
  band_score numeric CHECK (band_score >= 0 AND band_score <= 9),
  time_spent integer,
  completion_status text DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'abandoned')),
  ai_feedback jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create user_answers table
CREATE TABLE IF NOT EXISTS user_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer text,
  is_correct boolean,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_completed 
  ON test_attempts(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_test_attempts_user_status 
  ON test_attempts(user_id, completion_status);

CREATE INDEX IF NOT EXISTS idx_questions_test_order 
  ON questions(test_id, order_number);

CREATE INDEX IF NOT EXISTS idx_user_answers_attempt 
  ON user_answers(attempt_id);

CREATE INDEX IF NOT EXISTS idx_answers_question 
  ON answers(question_id);

-- Function to generate unique access code
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tests_updated_at ON tests;
CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for tests table (public read for test materials)
DROP POLICY IF EXISTS "Anyone can view tests" ON tests;
CREATE POLICY "Anyone can view tests"
  ON tests FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for questions table (public read)
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for answers table (public read)
DROP POLICY IF EXISTS "Anyone can view answers" ON answers;
CREATE POLICY "Anyone can view answers"
  ON answers FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for test_attempts table
DROP POLICY IF EXISTS "Users can view own test attempts" ON test_attempts;
CREATE POLICY "Users can view own test attempts"
  ON test_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own test attempts" ON test_attempts;
CREATE POLICY "Users can insert own test attempts"
  ON test_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own test attempts" ON test_attempts;
CREATE POLICY "Users can update own test attempts"
  ON test_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_answers table
DROP POLICY IF EXISTS "Users can view own answers" ON user_answers;
CREATE POLICY "Users can view own answers"
  ON user_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = user_answers.attempt_id
      AND test_attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own answers" ON user_answers;
CREATE POLICY "Users can insert own answers"
  ON user_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = user_answers.attempt_id
      AND test_attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own answers" ON user_answers;
CREATE POLICY "Users can update own answers"
  ON user_answers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = user_answers.attempt_id
      AND test_attempts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = user_answers.attempt_id
      AND test_attempts.user_id = auth.uid()
    )
  );