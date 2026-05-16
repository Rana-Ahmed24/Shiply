-- =============================================================================
-- Shiply Egypt — Row Level Security policies
-- Run after initial_schema.sql
-- =============================================================================

-- Helper: current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND 'admin' = ANY (roles) AND NOT is_suspended
  );
$$;

-- Helper: user is participant in a match
CREATE OR REPLACE FUNCTION public.is_match_participant(p_match_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.delivery_matches m
    WHERE m.id = p_match_id
      AND (m.traveler_id = auth.uid() OR m.customer_id = auth.uid())
  );
$$;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
CREATE POLICY profiles_select_own_or_public
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR public.is_admin()
    OR (NOT is_suspended)
  );

CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (id = auth.uid() AND NOT ('admin' = ANY (roles)))
  );

CREATE POLICY profiles_insert_own
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- traveler_listings
-- -----------------------------------------------------------------------------
CREATE POLICY listings_select_active_or_own
  ON public.traveler_listings FOR SELECT
  USING (
    status = 'active'
    OR traveler_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY listings_insert_traveler
  ON public.traveler_listings FOR INSERT
  WITH CHECK (traveler_id = auth.uid());

CREATE POLICY listings_update_own
  ON public.traveler_listings FOR UPDATE
  USING (traveler_id = auth.uid() OR public.is_admin());

CREATE POLICY listings_delete_own
  ON public.traveler_listings FOR DELETE
  USING (traveler_id = auth.uid() OR public.is_admin());

-- -----------------------------------------------------------------------------
-- customer_requests
-- -----------------------------------------------------------------------------
CREATE POLICY requests_select_open_or_own
  ON public.customer_requests FOR SELECT
  USING (
    status IN ('open', 'matched')
    OR customer_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY requests_insert_customer
  ON public.customer_requests FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY requests_update_own
  ON public.customer_requests FOR UPDATE
  USING (customer_id = auth.uid() OR public.is_admin());

-- -----------------------------------------------------------------------------
-- delivery_matches
-- -----------------------------------------------------------------------------
CREATE POLICY matches_select_participant
  ON public.delivery_matches FOR SELECT
  USING (
    traveler_id = auth.uid()
    OR customer_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY matches_insert_participant
  ON public.delivery_matches FOR INSERT
  WITH CHECK (
    initiated_by = auth.uid()
    AND (traveler_id = auth.uid() OR customer_id = auth.uid())
  );

CREATE POLICY matches_update_participant
  ON public.delivery_matches FOR UPDATE
  USING (
    traveler_id = auth.uid()
    OR customer_id = auth.uid()
    OR public.is_admin()
  );

-- -----------------------------------------------------------------------------
-- deposits
-- -----------------------------------------------------------------------------
CREATE POLICY deposits_select_participant
  ON public.deposits FOR SELECT
  USING (
    customer_id = auth.uid()
    OR public.is_match_participant(match_id)
    OR public.is_admin()
  );

CREATE POLICY deposits_insert_customer
  ON public.deposits FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY deposits_update_admin_only
  ON public.deposits FOR UPDATE
  USING (public.is_admin());

-- Financial writes from app should use service role + webhooks

-- -----------------------------------------------------------------------------
-- transactions
-- -----------------------------------------------------------------------------
CREATE POLICY transactions_select_own_or_match
  ON public.transactions FOR SELECT
  USING (
    user_id = auth.uid()
    OR (match_id IS NOT NULL AND public.is_match_participant(match_id))
    OR public.is_admin()
  );

-- Inserts/updates: service role only (no client policy)

-- -----------------------------------------------------------------------------
-- messages
-- -----------------------------------------------------------------------------
CREATE POLICY messages_select_match_participant
  ON public.messages FOR SELECT
  USING (public.is_match_participant(match_id) OR public.is_admin());

CREATE POLICY messages_insert_match_participant
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_match_participant(match_id)
  );

-- -----------------------------------------------------------------------------
-- message_reads
-- -----------------------------------------------------------------------------
CREATE POLICY message_reads_own
  ON public.message_reads FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- reviews
-- -----------------------------------------------------------------------------
CREATE POLICY reviews_select_public_or_participant
  ON public.reviews FOR SELECT
  USING (
    (is_public AND removed_at IS NULL)
    OR reviewer_id = auth.uid()
    OR reviewee_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY reviews_insert_participant
  ON public.reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
    AND public.is_match_participant(match_id)
  );

-- -----------------------------------------------------------------------------
-- verifications
-- -----------------------------------------------------------------------------
CREATE POLICY verifications_select_own_or_admin
  ON public.verifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY verifications_insert_own
  ON public.verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY verifications_update_admin
  ON public.verifications FOR UPDATE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- notifications
-- -----------------------------------------------------------------------------
CREATE POLICY notifications_select_own
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY notifications_update_own
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- admin_actions
-- -----------------------------------------------------------------------------
CREATE POLICY admin_actions_select_admin
  ON public.admin_actions FOR SELECT
  USING (public.is_admin());

CREATE POLICY admin_actions_insert_admin
  ON public.admin_actions FOR INSERT
  WITH CHECK (admin_id = auth.uid() AND public.is_admin());
