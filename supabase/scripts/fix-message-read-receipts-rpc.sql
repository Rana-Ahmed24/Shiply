-- Run in Supabase SQL Editor if read receipts do not persist after refresh

CREATE OR REPLACE FUNCTION public.match_read_message_ids(
  p_match_id UUID,
  p_viewer_id UUID
)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mr.message_id
  FROM public.message_reads mr
  INNER JOIN public.messages m ON m.id = mr.message_id
  INNER JOIN public.delivery_matches dm ON dm.id = m.match_id
  WHERE m.match_id = p_match_id
    AND m.sender_id = p_viewer_id
    AND m.deleted_at IS NULL
    AND mr.user_id = CASE
      WHEN dm.traveler_id = p_viewer_id THEN dm.customer_id
      ELSE dm.traveler_id
    END
    AND (
      auth.uid() = dm.traveler_id
      OR auth.uid() = dm.customer_id
    );
$$;

GRANT EXECUTE ON FUNCTION public.match_read_message_ids(UUID, UUID) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
