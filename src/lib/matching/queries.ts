import "server-only";

import {
  computeCompatibility,
  type ListingForMatch,
  type RequestForMatch,
} from "@/lib/matching/compatibility";
import { ACCEPTED_DB_STATUSES } from "@/lib/matching/constants";
import { MATCH_SELECT, type MatchRowRaw } from "@/lib/matching/db";
import { mapMatchToCard } from "@/lib/matching/mappers";
import { isMissingColumnError } from "@/lib/profile/db";
import { LISTING_SELECT_BASE } from "@/lib/listings/db";
import { createClient } from "@/lib/supabase/server";
import type { CompatibilityResult } from "@/types/match";
import type { HomeMatchItem, MatchesFeed } from "@/types/home-match";
import type { MatchCardModel, MatchDetailModel } from "@/types/match";

async function isTravelerVerified(travelerId: string): Promise<boolean> {
  const { fetchVerifiedTravelerIds } = await import(
    "@/lib/verification/queries"
  );
  const verified = await fetchVerifiedTravelerIds([travelerId]);
  return verified.has(travelerId);
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

  const verified = await isTravelerVerified(listing.traveler_id);
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

function formatPickup(
  city: string | null,
  country: string | null
): string {
  if (city && country) return `${city}, ${country}`;
  if (country) return country;
  if (city) return city;
  return "Any origin";
}

function formatArrival(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

function formatAcceptedAt(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

async function enrichMatchMeta(
  rows: MatchRowRaw[],
  viewerId: string,
  options?: { homeDetail?: boolean }
): Promise<MatchCardModel[] | HomeMatchItem[]> {
  if (rows.length === 0) return [];

  const supabase = await createClient();
  const listingIds = [...new Set(rows.map((r) => r.listing_id))];
  const requestIds = [...new Set(rows.map((r) => r.request_id))];
  const profileIds = new Set<string>();

  rows.forEach((r) => {
    profileIds.add(r.traveler_id);
    profileIds.add(r.customer_id);
  });

  const requestSelect = options?.homeDetail
    ? "id, title, preferred_origin_country_code, preferred_origin_city"
    : "id, title";

  const listingSelect = options?.homeDetail
    ? "id, origin_city, origin_country_code, destination_city, destination_country_code, arrival_at"
    : "id, origin_city, origin_country_code, destination_city, destination_country_code";

  const travelerIds = [...new Set(rows.map((r) => r.traveler_id))];

  const [listingsRes, requestsRes, profilesRes, verifiedTravelers] =
    await Promise.all([
      supabase
        .from("traveler_listings")
        .select(listingSelect)
        .in("id", listingIds),
      supabase.from("customer_requests").select(requestSelect).in("id", requestIds),
      supabase.from("profiles").select("id, full_name").in("id", [...profileIds]),
      options?.homeDetail
        ? import("@/lib/verification/queries").then((m) =>
            m.fetchVerifiedTravelerIds(travelerIds)
          )
        : Promise.resolve(new Set<string>()),
    ]);

  type ListingRow = {
    id: string;
    origin_city: string;
    destination_city: string;
    destination_country_code: string;
    arrival_at?: string;
  };

  type RequestRow = {
    id: string;
    title: string;
    preferred_origin_country_code?: string | null;
    preferred_origin_city?: string | null;
  };

  const listingMap = new Map(
    (listingsRes.data as ListingRow[] | null ?? []).map((l) => [
      l.id,
      `${l.origin_city} → ${l.destination_city}`,
    ])
  );
  const listingDetailMap = new Map(
    (listingsRes.data as ListingRow[] | null ?? []).map((l) => [l.id, l])
  );
  const requestMap = new Map(
    (requestsRes.data as RequestRow[] | null ?? []).map((r) => [r.id, r.title])
  );
  const requestDetailMap = new Map(
    (requestsRes.data as RequestRow[] | null ?? []).map((r) => [r.id, r])
  );
  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id as string, p.full_name as string | null])
  );

  return rows.map((row) => {
    const counterpartyId =
      row.traveler_id === viewerId ? row.customer_id : row.traveler_id;
    const card = mapMatchToCard(row, viewerId, {
      listingRoute: listingMap.get(row.listing_id) ?? "Trip",
      requestTitle: requestMap.get(row.request_id) ?? "Request",
      counterpartyName: profileMap.get(counterpartyId) ?? null,
    });

    if (!options?.homeDetail) {
      return card;
    }

    const listing = listingDetailMap.get(row.listing_id);
    const request = requestDetailMap.get(row.request_id);
    const pickupLabel = formatPickup(
      request?.preferred_origin_city ?? null,
      request?.preferred_origin_country_code ?? null
    );
    const destinationLabel = listing
      ? `${listing.destination_city}${listing.destination_country_code ? `, ${listing.destination_country_code}` : ""}`
      : "Egypt";

    return {
      ...card,
      pickupLabel,
      destinationLabel,
      listingId: row.listing_id,
      requestId: row.request_id,
      customerId: row.customer_id,
      travelerId: row.traveler_id,
      acceptedAt: row.accepted_at,
      acceptedAtLabel: formatAcceptedAt(row.accepted_at),
      estimatedArrivalLabel: formatArrival(listing?.arrival_at),
      isViewerCustomer: row.customer_id === viewerId,
      isViewerTraveler: row.traveler_id === viewerId,
      travelerName: profileMap.get(row.traveler_id) ?? null,
      customerName: profileMap.get(row.customer_id) ?? null,
      travelerVerified: verifiedTravelers.has(row.traveler_id),
    } satisfies HomeMatchItem;
  });
}

const HOME_MATCH_LIMIT = 12;

export async function getIncomingMatchesForTraveler(
  travelerId: string
): Promise<HomeMatchItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_matches")
    .select(MATCH_SELECT)
    .eq("traveler_id", travelerId)
    .eq("status", "pending")
    .neq("initiated_by", travelerId)
    .order("created_at", { ascending: false })
    .limit(HOME_MATCH_LIMIT);

  if (error) {
    console.error("[matching] getIncomingMatchesForTraveler:", error.message);
    return [];
  }

  return (await enrichMatchMeta((data ?? []) as MatchRowRaw[], travelerId, {
    homeDetail: true,
  })) as HomeMatchItem[];
}

export async function getSentPendingMatchesForCustomer(
  customerId: string
): Promise<HomeMatchItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_matches")
    .select(MATCH_SELECT)
    .eq("customer_id", customerId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(HOME_MATCH_LIMIT);

  if (error) {
    console.error("[matching] getSentPendingMatchesForCustomer:", error.message);
    return [];
  }

  return (await enrichMatchMeta((data ?? []) as MatchRowRaw[], customerId, {
    homeDetail: true,
  })) as HomeMatchItem[];
}

export async function countPendingIncomingForTraveler(
  travelerId: string
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("delivery_matches")
    .select("id", { count: "exact", head: true })
    .eq("traveler_id", travelerId)
    .eq("status", "pending")
    .neq("initiated_by", travelerId);

  if (error) {
    console.error("[matching] countPendingIncoming:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function countSentPendingForCustomer(
  customerId: string
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("delivery_matches")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .eq("status", "pending");

  if (error) {
    console.error("[matching] countSentPending:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getAcceptedMatchesForUser(
  userId: string
): Promise<HomeMatchItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_matches")
    .select(MATCH_SELECT)
    .or(`traveler_id.eq.${userId},customer_id.eq.${userId}`)
    .in("status", ACCEPTED_DB_STATUSES)
    .order("accepted_at", { ascending: false, nullsFirst: false })
    .limit(HOME_MATCH_LIMIT);

  if (error) {
    console.error("[matching] getAcceptedMatchesForUser:", error.message);
    return [];
  }

  return (await enrichMatchMeta((data ?? []) as MatchRowRaw[], userId, {
    homeDetail: true,
  })) as HomeMatchItem[];
}

export async function countAcceptedMatchesForUser(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("delivery_matches")
    .select("id", { count: "exact", head: true })
    .or(`traveler_id.eq.${userId},customer_id.eq.${userId}`)
    .in("status", ACCEPTED_DB_STATUSES);

  if (error) {
    console.error("[matching] countAcceptedMatches:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function countAcceptedForCustomer(customerId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("delivery_matches")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .in("status", ACCEPTED_DB_STATUSES);

  if (error) {
    console.error("[matching] countAcceptedForCustomer:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function countAcceptedForTraveler(travelerId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("delivery_matches")
    .select("id", { count: "exact", head: true })
    .eq("traveler_id", travelerId)
    .in("status", ACCEPTED_DB_STATUSES);

  if (error) {
    console.error("[matching] countAcceptedForTraveler:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getMatchesFeed(userId: string): Promise<MatchesFeed> {
  const [
    sent,
    incoming,
    accepted,
    sentCount,
    incomingCount,
    acceptedCount,
    customerAcceptedCount,
    travelerAcceptedCount,
  ] = await Promise.all([
    getSentPendingMatchesForCustomer(userId),
    getIncomingMatchesForTraveler(userId),
    getAcceptedMatchesForUser(userId),
    countSentPendingForCustomer(userId),
    countPendingIncomingForTraveler(userId),
    countAcceptedMatchesForUser(userId),
    countAcceptedForCustomer(userId),
    countAcceptedForTraveler(userId),
  ]);

  return {
    sent,
    incoming,
    accepted,
    sentCount,
    incomingCount,
    acceptedCount,
    customerAcceptedCount,
    travelerAcceptedCount,
  };
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

  return await enrichMatchMeta((data ?? []) as MatchRowRaw[], userId);
}

export async function getMatchHomeItem(
  id: string,
  viewerId: string
): Promise<HomeMatchItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_matches")
    .select(MATCH_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as MatchRowRaw;
  if (row.traveler_id !== viewerId && row.customer_id !== viewerId) {
    return null;
  }

  const items = (await enrichMatchMeta([row], viewerId, {
    homeDetail: true,
  })) as HomeMatchItem[];

  return items[0] ?? null;
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
