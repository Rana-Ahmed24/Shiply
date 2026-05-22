import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function roundAvg(sum: number, count: number): number | null {
  if (count === 0) return null;
  return Math.round((sum / count) * 100) / 100;
}

type PublicReviewRow = {
  rating: number;
  match_id: string;
};

/**
 * Recompute denormalized profile ratings from public, visible reviews only.
 */
export async function recalculateProfileRatings(revieweeId: string): Promise<void> {
  let client: Awaited<ReturnType<typeof createClient>>;
  try {
    client = createAdminClient();
  } catch {
    client = await createClient();
  }

  const { data: reviews, error } = await client
    .from("reviews")
    .select("rating, match_id")
    .eq("reviewee_id", revieweeId)
    .eq("is_public", true)
    .eq("is_flagged", false)
    .is("removed_at", null);

  if (error) {
    console.error("[reviews] recalculate fetch:", error.message);
    return;
  }

  const rows = (reviews ?? []) as PublicReviewRow[];
  if (rows.length === 0) {
    await client
      .from("profiles")
      .update({
        traveler_rating_avg: null,
        traveler_review_count: 0,
        customer_rating_avg: null,
        customer_review_count: 0,
      })
      .eq("id", revieweeId);
    return;
  }

  const matchIds = [...new Set(rows.map((r) => r.match_id))];
  const { data: matches } = await client
    .from("delivery_matches")
    .select("id, traveler_id, customer_id")
    .in("id", matchIds);

  const matchMap = new Map(
    (matches ?? []).map((m) => [
      m.id as string,
      {
        travelerId: m.traveler_id as string,
        customerId: m.customer_id as string,
      },
    ])
  );

  let travelerSum = 0;
  let travelerCount = 0;
  let customerSum = 0;
  let customerCount = 0;

  for (const row of rows) {
    const match = matchMap.get(row.match_id);
    if (!match) continue;
    if (match.travelerId === revieweeId) {
      travelerSum += row.rating;
      travelerCount += 1;
    }
    if (match.customerId === revieweeId) {
      customerSum += row.rating;
      customerCount += 1;
    }
  }

  await client
    .from("profiles")
    .update({
      traveler_rating_avg: roundAvg(travelerSum, travelerCount),
      traveler_review_count: travelerCount,
      customer_rating_avg: roundAvg(customerSum, customerCount),
      customer_review_count: customerCount,
    })
    .eq("id", revieweeId);
}
