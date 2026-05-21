-- =============================================================================
-- Shiply — Traveler verifications (run in Supabase SQL Editor)
-- Run ALL of this in ONE query (do not run line-by-line).
-- =============================================================================

-- Step A: Table
CREATE TABLE IF NOT EXISTS public.traveler_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  passport_url text,
  selfie_url text,
  ticket_url text,
  status text NOT NULL DEFAULT 'not_submitted',
  rejection_reason text,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT traveler_verifications_user_id_unique UNIQUE (user_id),
  CONSTRAINT traveler_verifications_status_check CHECK (
    status IN ('not_submitted', 'pending', 'verified', 'rejected')
  )
);

DROP TRIGGER IF EXISTS traveler_verifications_set_updated_at ON public.traveler_verifications;

CREATE TRIGGER traveler_verifications_set_updated_at
  BEFORE UPDATE ON public.traveler_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS traveler_verifications_status_idx
  ON public.traveler_verifications (status, created_at DESC);

ALTER TABLE public.traveler_verifications ENABLE ROW LEVEL SECURITY;

-- Step B: Table RLS
DROP POLICY IF EXISTS traveler_verifications_select_own_or_admin ON public.traveler_verifications;
DROP POLICY IF EXISTS traveler_verifications_insert_own ON public.traveler_verifications;
DROP POLICY IF EXISTS traveler_verifications_update_own_or_admin ON public.traveler_verifications;

CREATE POLICY traveler_verifications_select_own_or_admin
  ON public.traveler_verifications
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY traveler_verifications_insert_own
  ON public.traveler_verifications
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY traveler_verifications_update_own_or_admin
  ON public.traveler_verifications
  FOR UPDATE
  USING (
    public.is_admin()
    OR (user_id = auth.uid() AND status IN ('not_submitted', 'pending', 'rejected'))
  )
  WITH CHECK (
    public.is_admin()
    OR (user_id = auth.uid() AND status IN ('not_submitted', 'pending', 'rejected'))
  );

-- Step C: Private storage bucket (public = false)
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

-- Step D: Storage RLS
DROP POLICY IF EXISTS traveler_verifications_storage_select ON storage.objects;
DROP POLICY IF EXISTS traveler_verifications_storage_insert ON storage.objects;
DROP POLICY IF EXISTS traveler_verifications_storage_update ON storage.objects;
DROP POLICY IF EXISTS traveler_verifications_storage_delete ON storage.objects;

CREATE POLICY traveler_verifications_storage_select
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'traveler-verifications'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

CREATE POLICY traveler_verifications_storage_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'traveler-verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY traveler_verifications_storage_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'traveler-verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'traveler-verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY traveler_verifications_storage_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'traveler-verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
