-- Run in Supabase SQL Editor if customer request migration was not applied

DO $$ BEGIN
  CREATE TYPE public.request_urgency AS ENUM ('flexible', 'normal', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.request_lifecycle AS ENUM (
    'pending', 'accepted', 'purchased', 'shipped', 'delivered', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.customer_requests
  ADD COLUMN IF NOT EXISTS product_link TEXT,
  ADD COLUMN IF NOT EXISTS urgency public.request_urgency NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS lifecycle_status public.request_lifecycle NOT NULL DEFAULT 'pending';
