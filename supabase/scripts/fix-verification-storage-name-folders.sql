-- Run in Supabase SQL Editor: allow storage folders named `{name}__{userId}`
-- New uploads use readable folders; legacy `{userId}` folders still work.

CREATE OR REPLACE FUNCTION public.verification_storage_folder_allowed(folder text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    folder = auth.uid()::text
    OR (
      strpos(folder, '__') > 0
      AND split_part(folder, '__', 2) = auth.uid()::text
    );
$$;

DROP POLICY IF EXISTS traveler_verifications_storage_select ON storage.objects;
DROP POLICY IF EXISTS traveler_verifications_storage_insert ON storage.objects;
DROP POLICY IF EXISTS traveler_verifications_storage_update ON storage.objects;
DROP POLICY IF EXISTS traveler_verifications_storage_delete ON storage.objects;

CREATE POLICY traveler_verifications_storage_select
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'traveler-verifications'
    AND (
      public.verification_storage_folder_allowed((storage.foldername(name))[1])
      OR public.is_admin()
    )
  );

CREATE POLICY traveler_verifications_storage_insert
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'traveler-verifications'
    AND public.verification_storage_folder_allowed((storage.foldername(name))[1])
  );

CREATE POLICY traveler_verifications_storage_update
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'traveler-verifications'
    AND public.verification_storage_folder_allowed((storage.foldername(name))[1])
  )
  WITH CHECK (
    bucket_id = 'traveler-verifications'
    AND public.verification_storage_folder_allowed((storage.foldername(name))[1])
  );

CREATE POLICY traveler_verifications_storage_delete
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'traveler-verifications'
    AND public.verification_storage_folder_allowed((storage.foldername(name))[1])
  );
