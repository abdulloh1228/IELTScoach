/*
  # Update Listening Module for IELTS Official Format

  1. Modified Tables
    - `listening_tests`
      - Add `duration` (integer) - test duration in seconds (default 1800 = 30 minutes)
    
    - `listening_questions`
      - Add `section_number` (integer) - which part (1-4)
      - Add `question_type` (text) - type of question (form_completion, multiple_choice, etc.)
      - Add `image_url` (text, nullable) - for map labeling or diagram questions
      - Add `table_structure` (jsonb, nullable) - for table/form completion questions
      - Add `options` (jsonb, nullable) - for multiple choice questions
    
    - `listening_answers`
      - Modify to support multiple acceptable answers
      - Add `acceptable_answers` (jsonb) - array of acceptable answer variations

  2. New Tables
    - `listening_sections`
      - `id` (uuid, primary key)
      - `test_id` (uuid, foreign key to listening_tests)
      - `section_number` (integer) - 1, 2, 3, or 4
      - `question_start` (integer) - starting question number
      - `question_end` (integer) - ending question number
      - `instructions` (text) - section-specific instructions
    
    - `listening_attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `test_id` (uuid, foreign key to listening_tests)
      - `correct_answers` (integer) - number of correct answers
      - `band_score` (numeric) - IELTS band score
      - `completed_at` (timestamp)

  3. Security
    - Enable RLS on new tables
    - Users can only view their own attempts

  4. Indexes
    - Index on section_number for fast section lookup
    - Index on question_type for filtering
*/

-- Add duration to listening_tests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listening_tests' AND column_name = 'duration'
  ) THEN
    ALTER TABLE listening_tests ADD COLUMN duration integer DEFAULT 1800 NOT NULL;
  END IF;
END $$;

-- Add new columns to listening_questions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listening_questions' AND column_name = 'section_number'
  ) THEN
    ALTER TABLE listening_questions ADD COLUMN section_number integer DEFAULT 1 NOT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listening_questions' AND column_name = 'question_type'
  ) THEN
    ALTER TABLE listening_questions ADD COLUMN question_type text DEFAULT 'form_completion' NOT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listening_questions' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE listening_questions ADD COLUMN image_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listening_questions' AND column_name = 'table_structure'
  ) THEN
    ALTER TABLE listening_questions ADD COLUMN table_structure jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listening_questions' AND column_name = 'options'
  ) THEN
    ALTER TABLE listening_questions ADD COLUMN options jsonb;
  END IF;
END $$;

-- Add acceptable_answers to listening_answers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listening_answers' AND column_name = 'acceptable_answers'
  ) THEN
    ALTER TABLE listening_answers ADD COLUMN acceptable_answers jsonb;
  END IF;
END $$;

-- Create listening_sections table
CREATE TABLE IF NOT EXISTS listening_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES listening_tests(id) ON DELETE CASCADE,
  section_number integer NOT NULL CHECK (section_number >= 1 AND section_number <= 4),
  question_start integer NOT NULL,
  question_end integer NOT NULL,
  instructions text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create listening_attempts table
CREATE TABLE IF NOT EXISTS listening_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES listening_tests(id) ON DELETE CASCADE,
  correct_answers integer NOT NULL DEFAULT 0,
  band_score numeric NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE listening_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listening_sections
CREATE POLICY "Authenticated users can view listening sections"
  ON listening_sections FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for listening_attempts
CREATE POLICY "Users can view own attempts"
  ON listening_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
  ON listening_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_listening_sections_test_id ON listening_sections(test_id);
CREATE INDEX IF NOT EXISTS idx_listening_sections_section_number ON listening_sections(section_number);
CREATE INDEX IF NOT EXISTS idx_listening_questions_section_number ON listening_questions(section_number);
CREATE INDEX IF NOT EXISTS idx_listening_questions_question_type ON listening_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_listening_attempts_user_id ON listening_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_attempts_test_id ON listening_attempts(test_id);
