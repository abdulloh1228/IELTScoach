/*
  # Remove Human Feedback Fields

  1. Changes
    - Remove human_feedback_requested column from writing_submissions
    - Remove human_feedback column from writing_submissions
    - Remove daily_tips table (no longer needed)

  2. Removed Columns
    - writing_submissions.human_feedback_requested
    - writing_submissions.human_feedback
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'writing_submissions' AND column_name = 'human_feedback_requested'
  ) THEN
    ALTER TABLE writing_submissions DROP COLUMN human_feedback_requested;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'writing_submissions' AND column_name = 'human_feedback'
  ) THEN
    ALTER TABLE writing_submissions DROP COLUMN human_feedback;
  END IF;
END $$;

DROP TABLE IF EXISTS daily_tips;