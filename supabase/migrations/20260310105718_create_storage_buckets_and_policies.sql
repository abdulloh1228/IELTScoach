/*
  # Storage Buckets Setup for Test Materials

  ## Overview
  Creates storage buckets for IELTS test materials including audio files, images, charts, and diagrams.

  ## Buckets Created
    - listening-audio: Audio files for listening tests
    - question-images: General question images
    - charts: Charts and graphs for questions
    - reading-images: Images for reading passages

  ## Security
    - Public read access for all test materials
    - Authenticated users can upload (for admin purposes)
    - Proper file type restrictions
*/

-- Insert storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('listening-audio', 'listening-audio', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']::text[]),
  ('question-images', 'question-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]),
  ('charts', 'charts', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']::text[]),
  ('reading-images', 'reading-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for listening-audio bucket
DROP POLICY IF EXISTS "Public Access to Listening Audio" ON storage.objects;
CREATE POLICY "Public Access to Listening Audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listening-audio');

DROP POLICY IF EXISTS "Authenticated users can upload listening audio" ON storage.objects;
CREATE POLICY "Authenticated users can upload listening audio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listening-audio');

-- Storage policies for question-images bucket
DROP POLICY IF EXISTS "Public Access to Question Images" ON storage.objects;
CREATE POLICY "Public Access to Question Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'question-images');

DROP POLICY IF EXISTS "Authenticated users can upload question images" ON storage.objects;
CREATE POLICY "Authenticated users can upload question images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'question-images');

-- Storage policies for charts bucket
DROP POLICY IF EXISTS "Public Access to Charts" ON storage.objects;
CREATE POLICY "Public Access to Charts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'charts');

DROP POLICY IF EXISTS "Authenticated users can upload charts" ON storage.objects;
CREATE POLICY "Authenticated users can upload charts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'charts');

-- Storage policies for reading-images bucket
DROP POLICY IF EXISTS "Public Access to Reading Images" ON storage.objects;
CREATE POLICY "Public Access to Reading Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reading-images');

DROP POLICY IF EXISTS "Authenticated users can upload reading images" ON storage.objects;
CREATE POLICY "Authenticated users can upload reading images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'reading-images');