-- Run in Supabase SQL Editor if delivery_preferences column is missing
ALTER TABLE public.traveler_listings
  ADD COLUMN IF NOT EXISTS delivery_preferences TEXT[] NOT NULL DEFAULT '{}';
