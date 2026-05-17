import type { SupabaseClient } from "@supabase/supabase-js";

import type { TravelerTier } from "@/lib/profile/constants";
import { resolveTravelerTier } from "@/lib/profile/tier";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

export const PROFILE_SELECT_BASE =
  "id, full_name, avatar_url, phone, bio, roles, traveler_rating_avg, traveler_review_count, customer_rating_avg, customer_review_count, created_at";

export const PROFILE_SELECT_EXTENDED = `${PROFILE_SELECT_BASE}, languages, meetup_locations, deals_completed, traveler_tier`;

export type ProfileRowRaw = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  roles: ("customer" | "traveler" | "admin")[];
  languages?: string[] | null;
  meetup_locations?: string[] | null;
  deals_completed?: number | null;
  traveler_tier?: TravelerTier | null;
  traveler_rating_avg: number | null;
  traveler_review_count: number;
  customer_rating_avg: number | null;
  customer_review_count: number;
  created_at: string;
};

export function isMissingColumnError(message: string): boolean {
  return (
    message.includes("does not exist") ||
    message.includes("Could not find") ||
    message.includes("schema cache")
  );
}

export async function fetchProfileById(
  supabase: Supabase,
  profileId: string
): Promise<{ data: ProfileRowRaw | null; error: string | null; usedFallback: boolean }> {
  const extended = await supabase
    .from("profiles")
    .select(PROFILE_SELECT_EXTENDED)
    .eq("id", profileId)
    .maybeSingle();

  if (!extended.error && extended.data) {
    return { data: extended.data as ProfileRowRaw, error: null, usedFallback: false };
  }

  if (extended.error && !isMissingColumnError(extended.error.message)) {
    return { data: null, error: extended.error.message, usedFallback: false };
  }

  const base = await supabase
    .from("profiles")
    .select(PROFILE_SELECT_BASE)
    .eq("id", profileId)
    .maybeSingle();

  if (base.error) {
    return { data: null, error: base.error.message, usedFallback: true };
  }

  return {
    data: base.data as ProfileRowRaw | null,
    error: null,
    usedFallback: true,
  };
}

export function normalizeProfileRow(row: ProfileRowRaw): ProfileRowRaw & {
  languages: string[];
  meetup_locations: string[];
  deals_completed: number;
  traveler_tier: TravelerTier;
} {
  const deals = row.deals_completed ?? 0;
  return {
    ...row,
    phone: row.phone ?? null,
    languages: row.languages ?? [],
    meetup_locations: row.meetup_locations ?? [],
    deals_completed: deals,
    traveler_tier: row.traveler_tier ?? resolveTravelerTier(deals),
  };
}

export async function updateProfileFields(
  supabase: Supabase,
  userId: string,
  data: {
    full_name: string;
    bio: string | null;
    phone: string | null;
    languages: string[];
    meetup_locations: string[];
  }
) {
  const extendedPayload = {
    full_name: data.full_name,
    bio: data.bio,
    phone: data.phone,
    languages: data.languages,
    meetup_locations: data.meetup_locations,
  };

  const { error } = await supabase
    .from("profiles")
    .update(extendedPayload)
    .eq("id", userId);

  if (!error) return { error: null };

  if (!isMissingColumnError(error.message)) {
    return { error };
  }

  return supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      bio: data.bio,
      phone: data.phone,
    })
    .eq("id", userId);
}
