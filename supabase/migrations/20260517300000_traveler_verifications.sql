-- Traveler verification (passport, selfie, ticket) — one row per user

CREATE TABLE public.traveler_verifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  passport_url      TEXT,
  selfie_url        TEXT,
  ticket_url        TEXT,
  status            TEXT NOT NULL DEFAULT 'not_submitted'
    CHECK (status IN ('not_submitted', 'pending', 'verified', 'rejected')),
  rejection_reason  TEXT,
  reviewed_by       UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT traveler_verifications_user_id_unique UNIQUE (user_id)
);

CREATE TRIGGER traveler_verifications_set_updated_at
  BEFORE UPDATE ON public.traveler_verifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX traveler_verifications_status_idx
  ON public.traveler_verifications (status, created_at DESC);

ALTER TABLE public.traveler_verifications ENABLE ROW LEVEL SECURITY;

-- Own row + admins + verified status visible to marketplace (badges, match checks)
CREATE POLICY traveler_verifications_select_marketplace
  ON public.traveler_verifications FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR status = 'verified'
  );

CREATE POLICY traveler_verifications_insert_own
  ON public.traveler_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY traveler_verifications_update_own_or_admin
  ON public.traveler_verifications FOR UPDATE
  USING (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND status IN ('not_submitted', 'pending', 'rejected')
    )
  )
  WITH CHECK (
    public.is_admin()
    OR (
      user_id = auth.uid()
      AND status IN ('not_submitted', 'pending', 'rejected')
    )
  );

-- Private bucket — signed URLs only (no public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('traveler-verifications', 'traveler-verifications', false)
ON CONFLICT (id) DO UPDATE SET public = false;

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
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

CREATE POLICY traveler_verifications_storage_insert
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'traveler-verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY traveler_verifications_storage_update
  ON storage.objects FOR UPDATE
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
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'traveler-verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
