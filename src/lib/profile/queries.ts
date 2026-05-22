import "server-only";

import {
  fetchProfileById,
  normalizeProfileRow,
  type ProfileRowRaw,
} from "@/lib/profile/db";
import { getPublicReviewsForProfile } from "@/lib/reviews/queries";
import { createClient } from "@/lib/supabase/server";
import { getTravelerVerification } from "@/lib/verification/queries";
import type { PublicProfile } from "@/types/profile";
import { hasRole } from "@/lib/auth/roles";

function mapProfileRow(
  row: ProfileRowRaw,
  extras: {
    verifications: PublicProfile["verifications"];
    travelerVerification: PublicProfile["travelerVerification"];
    reviews: PublicProfile["reviews"];
    is_owner: boolean;
  }
): PublicProfile {
  const normalized = normalizeProfileRow(row);
  return {
    id: normalized.id,
    full_name: normalized.full_name,
    avatar_url: normalized.avatar_url,
    phone: normalized.phone,
    bio: normalized.bio,
    roles: normalized.roles,
    languages: normalized.languages,
    meetup_locations: normalized.meetup_locations,
    deals_completed: normalized.deals_completed,
    traveler_tier: normalized.traveler_tier,
    traveler_rating_avg: normalized.traveler_rating_avg,
    traveler_review_count: normalized.traveler_review_count,
    customer_rating_avg: normalized.customer_rating_avg,
    customer_review_count: normalized.customer_review_count,
    created_at: normalized.created_at,
    verifications: extras.verifications,
    travelerVerification: extras.travelerVerification,
    reviews: extras.reviews,
    is_owner: extras.is_owner,
  };
}

export async function getPublicProfile(
  profileId: string,
  viewerId?: string | null
): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const { data: profile, error, usedFallback } = await fetchProfileById(
    supabase,
    profileId
  );

  if (error || !profile) {
    if (error) {
      console.error("[profile] getPublicProfile:", error);
    }
    return null;
  }

  if (usedFallback) {
    console.warn(
      "[profile] Using base profile columns only. Run supabase/scripts/fix-profile-columns.sql in Supabase."
    );
  }

  const verifications = await fetchVerifications(supabase, profileId);
  const reviews = await getPublicReviewsForProfile(profileId);
  const normalized = normalizeProfileRow(profile);
  const travelerVerification = hasRole(normalized.roles, "traveler")
    ? await getTravelerVerification(profileId)
    : null;

  return mapProfileRow(profile, {
    verifications,
    travelerVerification,
    reviews,
    is_owner: viewerId === profileId,
  });
}

async function fetchVerifications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from("verifications")
    .select("type, status")
    .eq("user_id", userId)
    .eq("status", "approved");

  if (error) {
    if (error.message.includes("does not exist")) return [];
    return [];
  }

  return (data ?? []).map((v) => ({
    type: v.type as string,
    status: v.status as string,
  }));
}

export function getDisplayStats(profile: PublicProfile) {
  const isTraveler = hasRole(profile.roles, "traveler");
  return {
    rating: isTraveler
      ? profile.traveler_rating_avg
      : profile.customer_rating_avg,
    reviewCount: isTraveler
      ? profile.traveler_review_count
      : profile.customer_review_count,
    dealsLabel: isTraveler ? "Deals completed" : "Orders completed",
    dealsValue: profile.deals_completed,
  };
}
