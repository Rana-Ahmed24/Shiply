import "server-only";

import {
  computeCompatibility,
  type ListingForMatch,
  type RequestForMatch,
} from "@/lib/matching/compatibility";
import { MATCH_SELECT, type MatchRowRaw } from "@/lib/matching/db";
import { mapMatchToCard } from "@/lib/matching/mappers";
import { isMissingColumnError } from "@/lib/profile/db";
import { LISTING_SELECT_BASE } from "@/lib/listings/db";
import { createClient } from "@/lib/supabase/server";
import type { CompatibilityResult } from "@/types/match";
import type { MatchCardModel, MatchDetailModel } from "@/types/match";

async function isTravelerVerified(
  supabase: Awaited<ReturnType<typeof createClient>>,
  travelerId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("verifications")
    .select("user_id")
    .eq("user_id", travelerId)
    .eq("status", "approved")
    .in("type", ["passport", "government_id", "flight_itinerary"])
    .limit(1);

  return (data?.length ?? 0) > 0;
}

export async function fetchListingForMatch(
  listingId: string
): Promise<ListingForMatch | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("traveler_listings")
    .select(
      "id, traveler_id, origin_city, origin_country_code, destination_city, destination_country_code, departure_at, arrival_at, available_weight_kg, accepted_categories, status"
    )
    .eq("id", listingId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[matching] fetchListingForMatch:", error.message);
    return null;
  }

  return data as ListingForMatch;
}

export async function fetchRequestForMatch(
  requestId: string
): Promise<RequestForMatch | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_requests")
    .select(
      "id, customer_id, item_category, estimated_weight_kg, max_budget, currency, preferred_origin_country_code, preferred_origin_city, needed_by, status, lifecycle_status"
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[matching] fetchRequestForMatch:", error.message);
    return null;
  }

  return data as RequestForMatch;
}

export async function getCompatibilityForPair(
  listingId: string,
  requestId: string
): Promise<CompatibilityResult | null> {
  const listing = await fetchListingForMatch(listingId);
  const request = await fetchRequestForMatch(requestId);
  if (!listing || !request) return null;

  const supabase = await createClient();
  const verified = await isTravelerVerified(supabase, listing.traveler_id);
  return computeCompatibility(listing, request, verified);
}

export async function getMatchByRequestId(
  requestId: string
): Promise<MatchRowRaw | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_matches")
    .select(MATCH_SELECT)
    .eq("request_id", requestId)
    .maybeSingle();

  if (error) {
    if (isMissingColumnError(error.message)) {
      const fallback = await supabase
        .from("delivery_matches")
        .select(
          "id, listing_id, request_id, traveler_id, customer_id, agreed_price, currency, platform_fee_amount, status, initiated_by, accepted_at, completed_at, cancelled_at, cancellation_reason, created_at, updated_at"
        )
        .eq("request_id", requestId)
        .maybeSingle();
      return (fallback.data as MatchRowRaw | null) ?? null;
    }
    console.error("[matching] getMatchByRequestId:", error.message);
    return null;
  }

  return (data as MatchRowRaw | null) ?? null;
}

async function enrichMatchMeta(
  rows: MatchRowRaw[],
  viewerId: string
): Promise<MatchCardModel[]> {
  if (rows.length === 0) return [];

  const supabase = await createClient();
  const listingIds = [...new Set(rows.map((r) => r.listing_id))];
  const requestIds = [...new Set(rows.map((r) => r.request_id))];
  const profileIds = new Set<string>();

  rows.forEach((r) => {
    profileIds.add(
      r.traveler_id === viewerId ? r.customer_id : r.traveler_id
    );
  });

  const [listingsRes, requestsRes, profilesRes] = await Promise.all([
    supabase
      .from("traveler_listings")
      .select(
        "id, origin_city, origin_country_code, destination_city, destination_country_code"
      )
      .in("id", listingIds),
    supabase.from("customer_requests").select("id, title").in("id", requestIds),
    supabase.from("profiles").select("id, full_name").in("id", [...profileIds]),
  ]);

  const listingMap = new Map(
    (listingsRes.data ?? []).map((l) => [
      l.id as string,
      `${l.origin_city} → ${l.destination_city}`,
    ])
  );
  const requestMap = new Map(
    (requestsRes.data ?? []).map((r) => [r.id as string, r.title as string])
  );
  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id as string, p.full_name as string | null])
  );

  return rows.map((row) => {
    const counterpartyId =
      row.traveler_id === viewerId ? row.customer_id : row.traveler_id;
    return mapMatchToCard(row, viewerId, {
      listingRoute: listingMap.get(row.listing_id) ?? "Trip",
      requestTitle: requestMap.get(row.request_id) ?? "Request",
      counterpartyName: profileMap.get(counterpartyId) ?? null,
    });
  });
}

export async function getMatchesForUser(
  userId: string
): Promise<MatchCardModel[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("delivery_matches")
    .select(MATCH_SELECT)
    .or(`traveler_id.eq.${userId},customer_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[matching] getMatchesForUser:", error.message);
    return [];
  }

  return enrichMatchMeta((data ?? []) as MatchRowRaw[], userId);
}

export async function getMatchById(
  id: string,
  viewerId: string
): Promise<MatchDetailModel | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_matches")
    .select(MATCH_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[matching] getMatchById:", error.message);
    return null;
  }

  const row = data as MatchRowRaw;
  if (row.traveler_id !== viewerId && row.customer_id !== viewerId) {
    return null;
  }

  const cards = await enrichMatchMeta([row], viewerId);
  const card = cards[0];
  if (!card) return null;

  return {
    ...card,
    listingId: row.listing_id,
    requestId: row.request_id,
    travelerId: row.traveler_id,
    customerId: row.customer_id,
    factors: Array.isArray(row.compatibility_factors)
      ? (row.compatibility_factors as MatchDetailModel["factors"])
      : [],
    cancellationReason: row.cancellation_reason,
  };
}

export async function getCustomerOpenRequestsForMatching(
  customerId: string
): Promise<{ id: string; title: string; category: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_requests")
    .select("id, title, item_category, status, lifecycle_status")
    .eq("customer_id", customerId)
    .eq("status", "open")
    .eq("lifecycle_status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[matching] getCustomerOpenRequests:", error.message);
    return [];
  }

  const open = data ?? [];
  const eligible: { id: string; title: string; category: string }[] = [];

  for (const row of open) {
    const existing = await getMatchByRequestId(row.id as string);
    if (!existing || existing.status === "cancelled") {
      eligible.push({
        id: row.id as string,
        title: row.title as string,
        category: row.item_category as string,
      });
    }
  }

  return eligible;
}

export async function getTravelerActiveListingsForMatching(
  travelerId: string
): Promise<{ id: string; route: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("traveler_listings")
    .select(`${LISTING_SELECT_BASE}`)
    .eq("traveler_id", travelerId)
    .eq("status", "active")
    .order("arrival_at", { ascending: true });

  if (error) {
    console.error("[matching] getTravelerActiveListings:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    route: `${row.origin_city} → ${row.destination_city}`,
  }));
}
