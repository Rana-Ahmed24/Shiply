-- Request product images bucket + RLS

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
