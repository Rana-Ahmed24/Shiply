import "server-only";

import { LISTING_PAGE_SIZE, type ListingSort } from "@/lib/listings/constants";
import {
  LISTING_SELECT_BASE,
  LISTING_SELECT_EXTENDED,
  normalizeListingRow,
  normalizeListingRows,
  type ListingRowRaw,
} from "@/lib/listings/db";
import { mapListingToCard, mapListingToDetail } from "@/lib/listings/mappers";
import { isMissingColumnError } from "@/lib/profile/db";
import { createClient } from "@/lib/supabase/server";
import type {
  ListingCardModel,
  ListingDetail,
  ListingsPageResult,
  ListingsSearchParams,
  ListingTravelerSummary,
  TravelerListingRow,
} from "@/types/listing";

type ProfileSnippet = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  traveler_rating_avg: number | null;
  traveler_review_count: number;
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

function parsePage(page?: string): number {
  const n = Number(page);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

type ListingsQuery = {
  order: (
    column: string,
    options: { ascending: boolean }
  ) => ListingsQuery;
};

function applySort<T extends ListingsQuery>(query: T, sort: ListingSort): T {
  switch (sort) {
    case "arrival_desc":
      return query.order("arrival_at", { ascending: false }) as T;
    case "capacity_desc":
      return query.order("available_weight_kg", { ascending: false }) as T;
    case "newest":
      return query.order("created_at", { ascending: false }) as T;
    case "arrival_asc":
    default:
      return query.order("arrival_at", { ascending: true }) as T;
  }
}

function applySearchFilters(
  query: ReturnType<SupabaseClient["from"]>,
  params: ListingsSearchParams
) {
  let q = query;

  if (params.origin) {
    q = q.eq("origin_country_code", params.origin.toUpperCase());
  }

  if (params.destination) {
    q = q.ilike("destination_city", `%${params.destination}%`);
  }

  if (params.category) {
    q = q.contains("accepted_categories", [params.category]);
  }

  if (
    params.service === "shop_and_ship" ||
    params.service === "ship_only" ||
    params.service === "both"
  ) {
    q = q.eq("service_type", params.service);
  }

  if (params.q?.trim()) {
    const term = params.q.trim().replace(/[%_,]/g, "");
    if (term.length > 0) {
      q = q.or(
        `origin_city.ilike.%${term}%,destination_city.ilike.%${term}%,notes.ilike.%${term}%`
      );
    }
  }

  return q;
}

async function fetchTravelers(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, ListingTravelerSummary>> {
  if (ids.length === 0) return new Map();

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, avatar_url, traveler_rating_avg, traveler_review_count"
    )
    .in("id", ids);

  const map = new Map<string, ListingTravelerSummary>();
  (data as ProfileSnippet[] | null)?.forEach((p) => {
    map.set(p.id, {
      id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      traveler_rating_avg: p.traveler_rating_avg,
      traveler_review_count: p.traveler_review_count,
    });
  });
  return map;
}

async function fetchVerifiedTravelerIds(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Set<string>> {
  if (ids.length === 0) return new Set();

  const { data } = await supabase
    .from("verifications")
    .select("user_id")
    .in("user_id", ids)
    .eq("status", "approved")
    .in("type", ["passport", "government_id", "flight_itinerary"]);

  return new Set((data ?? []).map((v) => v.user_id as string));
}

function mapRowsToCards(
  rows: TravelerListingRow[],
  travelers: Map<string, ListingTravelerSummary>,
  verified: Set<string>
): ListingCardModel[] {
  return rows.map((row) =>
    mapListingToCard(
      row,
      travelers.get(row.traveler_id),
      verified.has(row.traveler_id)
    )
  );
}

export async function searchListings(
  params: ListingsSearchParams
): Promise<ListingsPageResult> {
  const supabase = await createClient();
  const page = parsePage(params.page);
  const sort = (params.sort ?? "arrival_asc") as ListingSort;
  const from = (page - 1) * LISTING_PAGE_SIZE;
  const to = from + LISTING_PAGE_SIZE - 1;

  const runSearch = (select: string) => {
    let query = applySearchFilters(
      supabase.from("traveler_listings").select(select, { count: "exact" }),
      params
    ).eq("status", "active");

    query = applySort(query, sort);
    return query.range(from, to);
  };

  let result = await runSearch(LISTING_SELECT_EXTENDED);

  if (result.error && isMissingColumnError(result.error.message)) {
    result = await runSearch(LISTING_SELECT_BASE);
  }

  if (result.error) {
    console.error("[listings] searchListings:", result.error.message);
    return {
      listings: [],
      total: 0,
      page,
      pageSize: LISTING_PAGE_SIZE,
      totalPages: 0,
    };
  }

  const rows = normalizeListingRows((result.data ?? []) as ListingRowRaw[]);
  const travelerIds = [...new Set(rows.map((r) => r.traveler_id))];
  const [travelers, verified] = await Promise.all([
    fetchTravelers(supabase, travelerIds),
    fetchVerifiedTravelerIds(supabase, travelerIds),
  ]);

  const total = result.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LISTING_PAGE_SIZE));

  return {
    listings: mapRowsToCards(rows, travelers, verified),
    total,
    page,
    pageSize: LISTING_PAGE_SIZE,
    totalPages,
  };
}

export async function getFeaturedListings(
  limit = 3
): Promise<ListingCardModel[]> {
  const result = await searchListings({ sort: "arrival_asc", page: "1" });
  return result.listings.slice(0, limit);
}

export async function getListingById(
  id: string,
  options?: { includeNonActive?: boolean }
): Promise<ListingDetail | null> {
  const supabase = await createClient();

  const runFetch = (select: string) => {
    let query = supabase
      .from("traveler_listings")
      .select(select)
      .eq("id", id);

    if (!options?.includeNonActive) {
      query = query.eq("status", "active");
    }

    return query.maybeSingle();
  };

  let { data, error } = await runFetch(LISTING_SELECT_EXTENDED);

  if (error && isMissingColumnError(error.message)) {
    ({ data, error } = await runFetch(LISTING_SELECT_BASE));
  }

  if (error || !data) {
    if (error) console.error("[listings] getListingById:", error.message);
    return null;
  }

  const row = normalizeListingRow(data as unknown as ListingRowRaw);
  const travelers = await fetchTravelers(supabase, [row.traveler_id]);
  const verified = await fetchVerifiedTravelerIds(supabase, [row.traveler_id]);

  return mapListingToDetail(
    row,
    travelers.get(row.traveler_id),
    verified.has(row.traveler_id)
  );
}

export async function getTravelerListings(
  travelerId: string
): Promise<ListingCardModel[]> {
  const supabase = await createClient();

  const extended = await supabase
    .from("traveler_listings")
    .select(LISTING_SELECT_EXTENDED)
    .eq("traveler_id", travelerId)
    .order("created_at", { ascending: false });

  let rows: ListingRowRaw[] | null = (extended.data as ListingRowRaw[] | null) ?? null;
  let error = extended.error;

  if (error && isMissingColumnError(error.message)) {
    const fallback = await supabase
      .from("traveler_listings")
      .select(LISTING_SELECT_BASE)
      .eq("traveler_id", travelerId)
      .order("created_at", { ascending: false });
    rows = (fallback.data as ListingRowRaw[] | null) ?? null;
    error = fallback.error;
  }

  if (error || !rows) {
    if (error) console.error("[listings] getTravelerListings:", error.message);
    return [];
  }

  const normalized = normalizeListingRows(rows);
  const verified = await fetchVerifiedTravelerIds(supabase, [travelerId]);
  const travelers = await fetchTravelers(supabase, [travelerId]);

  return mapRowsToCards(normalized, travelers, verified);
}
