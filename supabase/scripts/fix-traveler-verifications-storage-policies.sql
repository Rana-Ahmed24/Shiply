-- Fix: verification document upload blocked by storage RLS
-- Run in Supabase → SQL Editor (whole file), then retry upload on /verify-traveler

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'traveler-verifications',
  'traveler-verifications',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

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
DROP POLICY IF EXISTS traveler_verifications_storage_admin ON storage.objects;

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
