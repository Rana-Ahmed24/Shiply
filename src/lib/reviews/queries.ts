import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminReviewRow,
  MatchReviewContext,
  ReviewDisplay,
  ReviewPartyRole,
  ReviewStats,
} from "@/types/review";

type ReviewRow = {
  id: string;
  match_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  is_public: boolean;
  is_flagged: boolean;
  removed_at: string | null;
};

type MatchParties = {
  id: string;
  status: string;
  traveler_id: string;
  customer_id: string;
};

function roleForUserOnMatch(
  userId: string,
  match: MatchParties
): ReviewPartyRole | null {
  if (match.traveler_id === userId) return "traveler";
  if (match.customer_id === userId) return "customer";
  return null;
}

function counterpartyRole(role: ReviewPartyRole): ReviewPartyRole {
  return role === "traveler" ? "customer" : "traveler";
}

async function loadProfileNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ids: string[]
): Promise<Map<string, string | null>> {
  if (ids.length === 0) return new Map();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", ids);
  return new Map((data ?? []).map((p) => [p.id as string, p.full_name as string | null]));
}

async function loadMatches(
  supabase: Awaited<ReturnType<typeof createClient>>,
  matchIds: string[]
): Promise<Map<string, MatchParties>> {
  if (matchIds.length === 0) return new Map();
  const { data } = await supabase
    .from("delivery_matches")
    .select("id, status, traveler_id, customer_id")
    .in("id", matchIds);
  return new Map(
    (data ?? []).map((m) => [
      m.id as string,
      m as MatchParties,
    ])
  );
}

function isPublicReview(row: Pick<ReviewRow, "is_public" | "is_flagged" | "removed_at">) {
  return row.is_public && !row.is_flagged && row.removed_at == null;
}

export async function getPublicReviewStats(
  userId: string,
  asRole: ReviewPartyRole
): Promise<ReviewStats> {
  const supabase = await createClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("rating, match_id")
    .eq("reviewee_id", userId)
    .eq("is_public", true)
    .eq("is_flagged", false)
    .is("removed_at", null);

  if (error || !reviews?.length) {
    return { averageRating: null, totalReviews: 0 };
  }

  const matchMap = await loadMatches(
    supabase,
    [...new Set(reviews.map((r) => r.match_id as string))]
  );

  const ratings: number[] = [];
  for (const row of reviews) {
    const match = matchMap.get(row.match_id as string);
    if (!match) continue;
    const revieweeRole = roleForUserOnMatch(userId, match);
    if (revieweeRole === asRole) {
      ratings.push(row.rating as number);
    }
  }

  if (ratings.length === 0) {
    return { averageRating: null, totalReviews: 0 };
  }

  const sum = ratings.reduce((a, b) => a + b, 0);
  return {
    averageRating: Math.round((sum / ratings.length) * 100) / 100,
    totalReviews: ratings.length,
  };
}

export async function getPublicReviewsForProfile(
  userId: string,
  limit = 10
): Promise<ReviewDisplay[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, match_id, reviewer_id, reviewee_id, rating, comment, created_at, is_public, is_flagged, removed_at"
    )
    .eq("reviewee_id", userId)
    .eq("is_public", true)
    .eq("is_flagged", false)
    .is("removed_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) return [];

  const rows = data as ReviewRow[];
  const matchMap = await loadMatches(supabase, [...new Set(rows.map((r) => r.match_id))]);
  const profileIds = [
    ...new Set(rows.flatMap((r) => [r.reviewer_id, r.reviewee_id])),
  ];
  const nameMap = await loadProfileNames(supabase, profileIds);

  return rows
    .map((row) => {
      const match = matchMap.get(row.match_id);
      if (!match) return null;
      const reviewerRole = roleForUserOnMatch(row.reviewer_id, match);
      const revieweeRole = roleForUserOnMatch(row.reviewee_id, match);
      if (!reviewerRole || !revieweeRole) return null;

      return {
        id: row.id,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
        reviewerId: row.reviewer_id,
        reviewerName: nameMap.get(row.reviewer_id) ?? null,
        revieweeId: row.reviewee_id,
        revieweeName: nameMap.get(row.reviewee_id) ?? null,
        reviewerRole,
        revieweeRole,
      } satisfies ReviewDisplay;
    })
    .filter((r): r is ReviewDisplay => r !== null);
}

export async function getMatchReviewContext(
  matchId: string,
  userId: string
): Promise<MatchReviewContext> {
  const empty: MatchReviewContext = {
    matchId,
    matchCompleted: false,
    isParticipant: false,
    canReview: false,
    alreadyReviewed: false,
    reviewerRole: null,
    revieweeRole: null,
    revieweeId: null,
    revieweeName: null,
    submittedReview: null,
  };

  const supabase = await createClient();
  const { data: match, error: matchError } = await supabase
    .from("delivery_matches")
    .select("id, status, traveler_id, customer_id")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError || !match) return empty;

  const parties = match as MatchParties;
  const reviewerRole = roleForUserOnMatch(userId, parties);
  const isParticipant = reviewerRole !== null;
  const matchCompleted = parties.status === "completed";

  if (!isParticipant) {
    return { ...empty, matchCompleted, isParticipant: false };
  }

  const revieweeRole = counterpartyRole(reviewerRole);
  const revieweeId =
    revieweeRole === "traveler" ? parties.traveler_id : parties.customer_id;

  const nameMap = await loadProfileNames(supabase, [revieweeId, userId]);

  const { data: existing } = await supabase
    .from("reviews")
    .select("rating, comment, created_at")
    .eq("match_id", matchId)
    .eq("reviewer_id", userId)
    .maybeSingle();

  const alreadyReviewed = Boolean(existing);

  return {
    matchId,
    matchCompleted,
    isParticipant: true,
    canReview: matchCompleted && !alreadyReviewed,
    alreadyReviewed,
    reviewerRole,
    revieweeRole,
    revieweeId,
    revieweeName: nameMap.get(revieweeId) ?? null,
    submittedReview: existing
      ? {
          rating: existing.rating as number,
          comment: existing.comment as string | null,
          createdAt: existing.created_at as string,
        }
      : null,
  };
}

export async function getAdminReviewQueue(): Promise<AdminReviewRow[]> {
  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, match_id, reviewer_id, reviewee_id, rating, comment, created_at, is_public, is_flagged, removed_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data?.length) return [];

  const rows = data as ReviewRow[];
  const matchMap = await loadMatches(supabase, [...new Set(rows.map((r) => r.match_id))]);
  const profileIds = [
    ...new Set(rows.flatMap((r) => [r.reviewer_id, r.reviewee_id])),
  ];
  const nameMap = await loadProfileNames(supabase, profileIds);

  return rows
    .map((row) => {
      const match = matchMap.get(row.match_id);
      if (!match) return null;
      const reviewerRole = roleForUserOnMatch(row.reviewer_id, match);
      const revieweeRole = roleForUserOnMatch(row.reviewee_id, match);
      if (!reviewerRole || !revieweeRole) return null;

      return {
        id: row.id,
        matchId: row.match_id,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
        isPublic: row.is_public,
        isFlagged: row.is_flagged,
        removedAt: row.removed_at,
        reviewerId: row.reviewer_id,
        reviewerName: nameMap.get(row.reviewer_id) ?? null,
        revieweeId: row.reviewee_id,
        revieweeName: nameMap.get(row.reviewee_id) ?? null,
        reviewerRole,
        revieweeRole,
      } satisfies AdminReviewRow;
    })
    .filter((r): r is AdminReviewRow => r !== null);
}

export { isPublicReview };
