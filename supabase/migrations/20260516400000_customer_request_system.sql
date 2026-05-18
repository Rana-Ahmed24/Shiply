-- Customer request lifecycle + product details (Shiply Step 8)

CREATE TYPE public.request_urgency AS ENUM (
  'flexible',
  'normal',
  'urgent'
);

CREATE TYPE public.request_lifecycle AS ENUM (
  'pending',
  'accepted',
  'purchased',
  'shipped',
  'delivered',
  'cancelled'
);

ALTER TABLE public.customer_requests
  ADD COLUMN IF NOT EXISTS product_link TEXT,
  ADD COLUMN IF NOT EXISTS urgency public.request_urgency NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS lifecycle_status public.request_lifecycle NOT NULL DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS public.customer_request_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID NOT NULL REFERENCES public.customer_requests (id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url  TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS customer_request_images_request_id_idx
  ON public.customer_request_images (request_id, sort_order);

ALTER TABLE public.customer_request_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY request_images_select_visible
  ON public.customer_request_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customer_requests r
      WHERE r.id = request_id
        AND (
          r.customer_id = auth.uid()
          OR r.status IN ('open', 'matched')
          OR public.is_admin()
        )
    )
  );

CREATE POLICY request_images_insert_own
  ON public.customer_request_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customer_requests r
      WHERE r.id = request_id AND r.customer_id = auth.uid()
    )
  );

CREATE POLICY request_images_delete_own
  ON public.customer_request_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.customer_requests r
      WHERE r.id = request_id AND r.customer_id = auth.uid()
    )
  );

-- Travelers can browse open customer requests (not cancelled/draft-only)
DROP POLICY IF EXISTS requests_select_open_or_own ON public.customer_requests;

CREATE POLICY requests_select_open_or_own
  ON public.customer_requests FOR SELECT
  USING (
    customer_id = auth.uid()
    OR public.is_admin()
    OR (
      status IN ('open', 'matched')
      AND lifecycle_status NOT IN ('cancelled', 'delivered')
    )
  );
