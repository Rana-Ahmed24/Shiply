-- Run if admin review moderation updates fail (missing UPDATE policy)
CREATE POLICY reviews_update_admin
  ON public.reviews FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
