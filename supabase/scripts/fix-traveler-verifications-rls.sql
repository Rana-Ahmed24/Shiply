-- Fix: verified badges / match verification check disappeared after migration.
-- Cause: RLS only allowed reading your own row, not other travelers' verified status.
-- Run once in Supabase SQL Editor.

DROP POLICY IF EXISTS traveler_verifications_select_own_or_admin ON public.traveler_verifications;

CREATE POLICY traveler_verifications_select_marketplace
  ON public.traveler_verifications FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR status = 'verified'
  );
