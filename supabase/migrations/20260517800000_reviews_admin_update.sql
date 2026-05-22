-- Allow admins to moderate reviews (hide, flag, remove)
CREATE POLICY reviews_update_admin
  ON public.reviews FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
