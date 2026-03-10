/*
  # Create listening_audios table

  1. New Tables
    - `listening_audios`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `description` (text, optional)
      - `audio_url` (text) - path to file in storage
      - `duration` (integer) - duration in seconds
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `listening_audios` table
    - Users can only view, insert, update, or delete their own audios
*/

CREATE TABLE IF NOT EXISTS listening_audios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  audio_url text NOT NULL,
  duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE listening_audios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audios"
  ON listening_audios FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audios"
  ON listening_audios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audios"
  ON listening_audios FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audios"
  ON listening_audios FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_listening_audios_user_id ON listening_audios(user_id);
