-- Delivery preferences for traveler listings (meetup style, handoff options, etc.)
ALTER TABLE public.traveler_listings
  ADD COLUMN IF NOT EXISTS delivery_preferences TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS traveler_listings_delivery_prefs_gin_idx
  ON public.traveler_listings USING GIN (delivery_preferences);