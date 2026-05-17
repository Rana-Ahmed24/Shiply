-- Run in Supabase SQL Editor if profile columns are missing

DO $$ BEGIN
  CREATE TYPE public.traveler_tier AS ENUM ('bronze', 'silver', 'gold');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS languages TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meetup_locations TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deals_completed INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS traveler_tier public.traveler_tier NOT NULL DEFAULT 'bronze';

NOTIFY pgrst, 'reload schema';
