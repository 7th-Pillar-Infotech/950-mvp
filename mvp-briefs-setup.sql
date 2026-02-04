-- MVP Briefs Storage & Lead Table Setup
-- Run this in your Supabase SQL editor or via psql

-- 1. Create the mvp_leads table (if it doesn't already exist)
CREATE TABLE IF NOT EXISTS mvp_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  idea TEXT NOT NULL,
  brief_url TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add brief_url column if the table already exists but lacks the column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mvp_leads' AND column_name = 'brief_url'
  ) THEN
    ALTER TABLE mvp_leads ADD COLUMN brief_url TEXT;
  END IF;
END $$;

-- 3. Create the mvp-briefs storage bucket
-- Run this via Supabase Dashboard > Storage > New Bucket, or use the API:
--   Bucket name: mvp-briefs
--   Public: true (so brief_url links are accessible)
--   File size limit: 10MB (10485760 bytes)
--   Allowed MIME types: application/pdf, application/msword,
--     application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--     text/plain, image/png, image/jpeg

-- If using Supabase SQL (requires service_role or superuser):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mvp-briefs',
  'mvp-briefs',
  true,
  10485760,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/png',
    'image/jpeg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policy: allow uploads from authenticated or anon users (server-side uploads via service key)
-- Adjust as needed for your security requirements.
CREATE POLICY IF NOT EXISTS "Allow public read on mvp-briefs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mvp-briefs');

CREATE POLICY IF NOT EXISTS "Allow anon uploads to mvp-briefs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'mvp-briefs');
