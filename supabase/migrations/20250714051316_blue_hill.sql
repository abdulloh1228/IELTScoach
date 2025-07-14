/*
  # Initial Schema for AI IELTS Instructor Platform

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `full_name` (text)
      - `email` (text)
      - `target_score` (decimal)
      - `current_score` (decimal)
      - `exam_date` (date)
      - `study_goal` (text)
      - `country` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `test_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `test_type` (text) - 'full_exam', 'writing', 'reading', 'speaking', 'listening'
      - `status` (text) - 'in_progress', 'completed', 'submitted'
      - `started_at` (timestamp)
      - `completed_at` (timestamp)
      - `overall_score` (decimal)
      - `created_at` (timestamp)
    
    - `test_results`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references test_sessions)
      - `section` (text) - 'writing', 'reading', 'speaking', 'listening'
      - `task_number` (integer) - for writing tasks 1/2
      - `score` (decimal)
      - `detailed_scores` (jsonb) - breakdown scores
      - `answers` (jsonb) - user answers
      - `feedback` (jsonb) - AI feedback
      - `created_at` (timestamp)
    
    - `writing_submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `session_id` (uuid, references test_sessions)
      - `task_type` (text) - 'task1', 'task2'
      - `prompt` (text)
      - `content` (text)
      - `submission_type` (text) - 'typed', 'uploaded'
      - `file_url` (text)
      - `word_count` (integer)
      - `band_score` (decimal)
      - `task_response` (decimal)
      - `coherence_cohesion` (decimal)
      - `lexical_resource` (decimal)
      - `grammatical_range` (decimal)
      - `ai_feedback` (jsonb)
      - `human_feedback_requested` (boolean)
      - `human_feedback` (text)
      - `created_at` (timestamp)
    
    - `speaking_recordings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `session_id` (uuid, references test_sessions)
      - `part_number` (integer) - 1, 2, or 3
      - `question` (text)
      - `recording_url` (text)
      - `duration` (integer) - in seconds
      - `band_score` (decimal)
      - `fluency_coherence` (decimal)
      - `pronunciation` (decimal)
      - `lexical_resource` (decimal)
      - `grammatical_range` (decimal)
      - `ai_feedback` (jsonb)
      - `created_at` (timestamp)
    
    - `reading_responses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `session_id` (uuid, references test_sessions)
      - `passage_id` (text)
      - `answers` (jsonb)
      - `correct_answers` (jsonb)
      - `score` (integer)
      - `total_questions` (integer)
      - `band_score` (decimal)
      - `time_taken` (integer) - in seconds
      - `created_at` (timestamp)
    
    - `listening_responses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `session_id` (uuid, references test_sessions)
      - `audio_id` (text)
      - `answers` (jsonb)
      - `correct_answers` (jsonb)
      - `score` (integer)
      - `total_questions` (integer)
      - `band_score` (decimal)
      - `created_at` (timestamp)
    
    - `study_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `weak_areas` (jsonb)
      - `recommendations` (jsonb)
      - `daily_goals` (jsonb)
      - `target_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `daily_tips`
      - `id` (uuid, primary key)
      - `category` (text) - 'grammar', 'vocabulary', 'writing', 'speaking'
      - `title` (text)
      - `content` (text)
      - `difficulty_level` (text) - 'beginner', 'intermediate', 'advanced'
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `human_feedback_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `submission_id` (uuid) - references writing_submissions or speaking_recordings
      - `submission_type` (text) - 'writing', 'speaking'
      - `status` (text) - 'pending', 'in_review', 'completed'
      - `instructor_id` (uuid)
      - `feedback` (text)
      - `detailed_scores` (jsonb)
      - `price` (decimal)
      - `requested_at` (timestamp)
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for instructors to access feedback requests
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  target_score decimal DEFAULT 7.0,
  current_score decimal DEFAULT 0.0,
  exam_date date,
  study_goal text DEFAULT 'General Improvement',
  country text,
  total_study_hours integer DEFAULT 0,
  tests_completed integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create test_sessions table
CREATE TABLE IF NOT EXISTS test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  test_type text NOT NULL CHECK (test_type IN ('full_exam', 'writing', 'reading', 'speaking', 'listening')),
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'submitted')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  overall_score decimal,
  created_at timestamptz DEFAULT now()
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES test_sessions(id) ON DELETE CASCADE NOT NULL,
  section text NOT NULL CHECK (section IN ('writing', 'reading', 'speaking', 'listening')),
  task_number integer,
  score decimal NOT NULL,
  detailed_scores jsonb DEFAULT '{}',
  answers jsonb DEFAULT '{}',
  feedback jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create writing_submissions table
CREATE TABLE IF NOT EXISTS writing_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES test_sessions(id) ON DELETE CASCADE,
  task_type text NOT NULL CHECK (task_type IN ('task1', 'task2')),
  prompt text NOT NULL,
  content text NOT NULL,
  submission_type text DEFAULT 'typed' CHECK (submission_type IN ('typed', 'uploaded')),
  file_url text,
  word_count integer DEFAULT 0,
  band_score decimal,
  task_response decimal,
  coherence_cohesion decimal,
  lexical_resource decimal,
  grammatical_range decimal,
  ai_feedback jsonb DEFAULT '{}',
  human_feedback_requested boolean DEFAULT false,
  human_feedback text,
  created_at timestamptz DEFAULT now()
);

-- Create speaking_recordings table
CREATE TABLE IF NOT EXISTS speaking_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES test_sessions(id) ON DELETE CASCADE,
  part_number integer NOT NULL CHECK (part_number IN (1, 2, 3)),
  question text NOT NULL,
  recording_url text,
  duration integer DEFAULT 0,
  band_score decimal,
  fluency_coherence decimal,
  pronunciation decimal,
  lexical_resource decimal,
  grammatical_range decimal,
  ai_feedback jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create reading_responses table
CREATE TABLE IF NOT EXISTS reading_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES test_sessions(id) ON DELETE CASCADE,
  passage_id text NOT NULL,
  answers jsonb DEFAULT '{}',
  correct_answers jsonb DEFAULT '{}',
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  band_score decimal,
  time_taken integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create listening_responses table
CREATE TABLE IF NOT EXISTS listening_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES test_sessions(id) ON DELETE CASCADE,
  audio_id text NOT NULL,
  answers jsonb DEFAULT '{}',
  correct_answers jsonb DEFAULT '{}',
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  band_score decimal,
  created_at timestamptz DEFAULT now()
);

-- Create study_plans table
CREATE TABLE IF NOT EXISTS study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  weak_areas jsonb DEFAULT '{}',
  recommendations jsonb DEFAULT '{}',
  daily_goals jsonb DEFAULT '{}',
  target_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_tips table
CREATE TABLE IF NOT EXISTS daily_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('grammar', 'vocabulary', 'writing', 'speaking', 'reading', 'listening')),
  title text NOT NULL,
  content text NOT NULL,
  difficulty_level text DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create human_feedback_requests table
CREATE TABLE IF NOT EXISTS human_feedback_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  submission_id uuid NOT NULL,
  submission_type text NOT NULL CHECK (submission_type IN ('writing', 'speaking')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed')),
  instructor_id uuid,
  feedback text,
  detailed_scores jsonb DEFAULT '{}',
  price decimal DEFAULT 15.00,
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaking_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_feedback_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for test_sessions
CREATE POLICY "Users can manage own test sessions"
  ON test_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for test_results
CREATE POLICY "Users can manage own test results"
  ON test_results
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM test_sessions WHERE user_id = auth.uid()
    )
  );

-- Create policies for writing_submissions
CREATE POLICY "Users can manage own writing submissions"
  ON writing_submissions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for speaking_recordings
CREATE POLICY "Users can manage own speaking recordings"
  ON speaking_recordings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for reading_responses
CREATE POLICY "Users can manage own reading responses"
  ON reading_responses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for listening_responses
CREATE POLICY "Users can manage own listening responses"
  ON listening_responses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for study_plans
CREATE POLICY "Users can manage own study plans"
  ON study_plans
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for daily_tips
CREATE POLICY "Anyone can read active daily tips"
  ON daily_tips
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create policies for human_feedback_requests
CREATE POLICY "Users can manage own feedback requests"
  ON human_feedback_requests
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Insert sample daily tips
INSERT INTO daily_tips (category, title, content, difficulty_level) VALUES
('writing', 'Use Complex Sentences', 'Practice using subordinating conjunctions like "although", "whereas", and "despite" to create more sophisticated sentence structures.', 'intermediate'),
('vocabulary', 'Academic Word List', 'Learn 10 new academic words daily from the Academic Word List (AWL) to improve your lexical resource score.', 'advanced'),
('speaking', 'Record Yourself Daily', 'Record yourself speaking for 2 minutes daily on different topics to improve fluency and identify pronunciation issues.', 'beginner'),
('grammar', 'Conditional Sentences', 'Master all four types of conditional sentences (zero, first, second, third) as they frequently appear in IELTS.', 'intermediate'),
('reading', 'Skimming Technique', 'Practice skimming passages in 2-3 minutes to get the main idea before reading for specific details.', 'beginner'),
('listening', 'Predict Answers', 'Before listening, read questions carefully and predict what type of information you need to listen for.', 'intermediate');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_plans_updated_at
  BEFORE UPDATE ON study_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();