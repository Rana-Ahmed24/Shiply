-- Fix: "new row violates row-level security policy" on request image upload
-- Run in Supabase SQL Editor after creating the request-images bucket.

INSERT INTO storage.buckets (id, name, public)
VALUES ('request-images', 'request-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS request_images_public_read ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_insert ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_select ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_update ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_delete ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_all ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_upload ON storage.objects;

-- Public read (public bucket)
CREATE POLICY request_images_public_read
  ON storage.objects FOR SELECT
  USING (bucket_id = 'request-images');

-- Authenticated users: full access under {userId}/... (matches avatar bucket pattern)
CREATE POLICY request_images_auth_all
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'request-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'request-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
