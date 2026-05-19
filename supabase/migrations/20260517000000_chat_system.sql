-- Chat: image-only messages, read receipts visibility, chat-images storage

ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_body_not_empty;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_body_not_empty CHECK (
    deleted_at IS NOT NULL
    OR length(trim(body)) > 0
    OR cardinality(attachment_paths) > 0
  );

-- Participants can see read receipts on messages in their matches
DROP POLICY IF EXISTS message_reads_select_participant ON public.message_reads;

CREATE POLICY message_reads_select_participant
  ON public.message_reads FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_reads.message_id
        AND public.is_match_participant(m.match_id)
    )
  );

-- Only allow messaging on active matches (accepted or in progress)
CREATE OR REPLACE FUNCTION public.can_chat_on_match(p_match_id UUID)
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
      AND m.status IN (
        'accepted', 'deposit_pending', 'deposit_held',
        'in_transit', 'delivered', 'completed'
      )
  );
$$;

DROP POLICY IF EXISTS messages_insert_match_participant ON public.messages;

CREATE POLICY messages_insert_match_participant
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.can_chat_on_match(match_id)
  );

-- Chat image attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS chat_images_public_read ON storage.objects;
DROP POLICY IF EXISTS chat_images_auth_all ON storage.objects;

CREATE POLICY chat_images_public_read
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-images');

CREATE POLICY chat_images_auth_all
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'chat-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
