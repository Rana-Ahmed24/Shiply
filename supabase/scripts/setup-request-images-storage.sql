-- =============================================================================
-- Shiply: request-images storage bucket + RLS
-- Run this entire file in Supabase Dashboard → SQL Editor
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('request-images', 'request-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  UPDATE storage.buckets
  SET
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif'
    ]::text[]
  WHERE id = 'request-images';
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

DROP POLICY IF EXISTS request_images_public_read ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_insert ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_select ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_update ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_delete ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_all ON storage.objects;
DROP POLICY IF EXISTS request_images_auth_upload ON storage.objects;

CREATE POLICY request_images_public_read
  ON storage.objects FOR SELECT
  USING (bucket_id = 'request-images');

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
