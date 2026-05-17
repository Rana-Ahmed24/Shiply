-- HitchHiker / Shiply — User profile system extensions

DO $$ BEGIN
  CREATE TYPE public.traveler_tier AS ENUM ('bronze', 'silver', 'gold');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS languages TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meetup_locations TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deals_completed INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS traveler_tier public.traveler_tier NOT NULL DEFAULT 'bronze';

CREATE INDEX IF NOT EXISTS profiles_traveler_tier_idx ON public.profiles (traveler_tier);

-- Avatar storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY avatars_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY avatars_auth_upload ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY avatars_auth_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY avatars_auth_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

NOTIFY pgrst, 'reload schema';
