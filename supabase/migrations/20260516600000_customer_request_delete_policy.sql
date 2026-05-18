-- Allow customers to permanently delete their own requests

DROP POLICY IF EXISTS requests_delete_own ON public.customer_requests;

CREATE POLICY requests_delete_own
  ON public.customer_requests FOR DELETE
  USING (customer_id = auth.uid() OR public.is_admin());
