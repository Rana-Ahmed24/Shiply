-- Optional compatibility snapshot on matches (computed at creation)
ALTER TABLE public.delivery_matches
  ADD COLUMN IF NOT EXISTS compatibility_score SMALLINT,
  ADD COLUMN IF NOT EXISTS compatibility_factors JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.delivery_matches.compatibility_score IS '0-100 score at match creation';
COMMENT ON COLUMN public.delivery_matches.compatibility_factors IS 'Route, dates, category, capacity, verification breakdown';
