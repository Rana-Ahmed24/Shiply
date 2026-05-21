-- Allow marketplace to see who is verified (badges, match score).
-- Users still only read/write their own row for pending/rejected; admins see all.

DROP POLICY IF EXISTS traveler_verifications_select_own_or_admin ON public.traveler_verifications;

CREATE POLICY traveler_verifications_select_marketplace
  ON public.traveler_verifications FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR status = 'verified'
  );
