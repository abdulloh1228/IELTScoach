/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses multiple security and performance issues identified by Supabase:
  1. Adds missing indexes on foreign keys for optimal query performance
  2. Optimizes RLS policies by using (select auth.uid()) pattern to avoid re-evaluation
  3. Fixes function search paths for security
  4. Removes unused indexes from old schema tables

  ## Changes

  ### 1. Add Missing Indexes on Foreign Keys
    - Indexes for test_attempts, user_answers, and other foreign key relationships
    - Improves query performance for joins and foreign key lookups

  ### 2. Optimize RLS Policies
    - Replace auth.uid() with (select auth.uid()) in all policies
    - Prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale

  ### 3. Fix Function Search Paths
    - Set explicit search_path for functions to prevent mutable path issues
*/

-- ============================================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- ============================================================================

-- Index for test_attempts.test_id (already has user_id indexed)
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id 
  ON test_attempts(test_id);

-- Index for user_answers.question_id (already has attempt_id indexed)
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id 
  ON user_answers(question_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - Use (select auth.uid()) pattern
-- ============================================================================

-- Drop and recreate policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Drop and recreate policies for test_attempts table
DROP POLICY IF EXISTS "Users can view own test attempts" ON test_attempts;
CREATE POLICY "Users can view own test attempts"
  ON test_attempts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own test attempts" ON test_attempts;
CREATE POLICY "Users can insert own test attempts"
  ON test_attempts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own test attempts" ON test_attempts;
CREATE POLICY "Users can update own test attempts"
  ON test_attempts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate policies for user_answers table with optimized subquery
DROP POLICY IF EXISTS "Users can view own answers" ON user_answers;
CREATE POLICY "Users can view own answers"
  ON user_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = user_answers.attempt_id
      AND test_attempts.user_id = (select auth.uid())
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
      AND test_attempts.user_id = (select auth.uid())
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
      AND test_attempts.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = user_answers.attempt_id
      AND test_attempts.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Recreate generate_access_code with explicit search_path
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recreate update_updated_at_column with explicit search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 4. OPTIMIZE OLD SCHEMA POLICIES (if they exist)
-- ============================================================================

-- Optimize profiles table policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
    CREATE POLICY "Users can read own profile"
      ON profiles FOR SELECT
      TO authenticated
      USING ((select auth.uid()) = id);

    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      TO authenticated
      USING ((select auth.uid()) = id)
      WITH CHECK ((select auth.uid()) = id);

    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT
      TO authenticated
      WITH CHECK ((select auth.uid()) = id);
  END IF;
END $$;

-- Optimize test_sessions table policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'test_sessions') THEN
    DROP POLICY IF EXISTS "Users can manage own test sessions" ON test_sessions;
    CREATE POLICY "Users can manage own test sessions"
      ON test_sessions
      TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);

    -- Add missing index
    CREATE INDEX IF NOT EXISTS idx_test_sessions_user_id ON test_sessions(user_id);
  END IF;
END $$;

-- Optimize test_results table policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'test_results') THEN
    DROP POLICY IF EXISTS "Users can manage own test results" ON test_results;
    CREATE POLICY "Users can manage own test results"
      ON test_results
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM test_sessions
          WHERE test_sessions.id = test_results.session_id
          AND test_sessions.user_id = (select auth.uid())
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM test_sessions
          WHERE test_sessions.id = test_results.session_id
          AND test_sessions.user_id = (select auth.uid())
        )
      );

    -- Add missing index
    CREATE INDEX IF NOT EXISTS idx_test_results_session_id ON test_results(session_id);
  END IF;
END $$;

-- Optimize writing_submissions table policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'writing_submissions') THEN
    DROP POLICY IF EXISTS "Users can manage own writing submissions" ON writing_submissions;
    CREATE POLICY "Users can manage own writing submissions"
      ON writing_submissions
      TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);

    -- Add missing indexes
    CREATE INDEX IF NOT EXISTS idx_writing_submissions_user_id ON writing_submissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_writing_submissions_session_id ON writing_submissions(session_id);
  END IF;
END $$;

-- Optimize speaking_recordings table policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'speaking_recordings') THEN
    DROP POLICY IF EXISTS "Users can manage own speaking recordings" ON speaking_recordings;
    CREATE POLICY "Users can manage own speaking recordings"
      ON speaking_recordings
      TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);

    -- Add missing indexes
    CREATE INDEX IF NOT EXISTS idx_speaking_recordings_user_id ON speaking_recordings(user_id);
    CREATE INDEX IF NOT EXISTS idx_speaking_recordings_session_id ON speaking_recordings(session_id);
  END IF;
END $$;

-- Optimize reading_responses table policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reading_responses') THEN
    DROP POLICY IF EXISTS "Users can manage own reading responses" ON reading_responses;
    CREATE POLICY "Users can manage own reading responses"
      ON reading_responses
      TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);

    -- Add missing indexes
    CREATE INDEX IF NOT EXISTS idx_reading_responses_user_id ON reading_responses(user_id);
    CREATE INDEX IF NOT EXISTS idx_reading_responses_session_id ON reading_responses(session_id);
  END IF;
END $$;

-- Optimize listening_responses table policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listening_responses') THEN
    DROP POLICY IF EXISTS "Users can manage own listening responses" ON listening_responses;
    CREATE POLICY "Users can manage own listening responses"
      ON listening_responses
      TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);

    -- Add missing indexes
    CREATE INDEX IF NOT EXISTS idx_listening_responses_user_id ON listening_responses(user_id);
    CREATE INDEX IF NOT EXISTS idx_listening_responses_session_id ON listening_responses(session_id);
  END IF;
END $$;

-- Optimize study_plans table policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'study_plans') THEN
    DROP POLICY IF EXISTS "Users can manage own study plans" ON study_plans;
    CREATE POLICY "Users can manage own study plans"
      ON study_plans
      TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);

    -- Add missing index
    CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
  END IF;
END $$;

-- Optimize submission_audit_logs table policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'submission_audit_logs') THEN
    DROP POLICY IF EXISTS "Users can view own submission logs" ON submission_audit_logs;
    CREATE POLICY "Users can view own submission logs"
      ON submission_audit_logs FOR SELECT
      TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;