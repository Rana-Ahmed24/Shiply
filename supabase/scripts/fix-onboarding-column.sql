-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Fixes: "Could not find the 'onboarding_completed' column of 'profiles'"

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Refresh PostgREST schema cache (Supabase usually picks this up within seconds)
NOTIFY pgrst, 'reload schema';
