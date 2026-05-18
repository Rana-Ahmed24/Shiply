-- Preferred home feed mode (does not restrict roles — users keep customer + traveler)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_mode TEXT NOT NULL DEFAULT 'customer'
    CHECK (preferred_mode IN ('customer', 'traveler'));

COMMENT ON COLUMN public.profiles.preferred_mode IS
  'Default UI mode: customer shows Travelers feed first; traveler shows Requests feed first.';
