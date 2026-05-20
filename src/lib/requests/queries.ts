import "server-only";

import {
  normalizeRequestRow,
  normalizeRequestRows,
  REQUEST_SELECT_BASE,
  REQUEST_SELECT_EXTENDED,
  type RequestRowRaw,
} from "@/lib/requests/db";
import { mapRequestToCard, mapRequestToDetail } from "@/lib/requests/mappers";
import { isMissingColumnError } from "@/lib/profile/db";
import { createClient } from "@/lib/supabase/server";
import type {
  RequestCardModel,
  RequestDetail,
  RequestSort,
  RequestsSearchParams,
} from "@/types/request";

export async function getCustomerRequests(
  customerId: string
): Promise<RequestCardModel[]> {
  const supabase = await createClient();

  let rows: RequestRowRaw[] | null = null;
  let error: { message: string } | null = null;

  const primary = await supabase
    .from("customer_requests")
    .select(REQUEST_SELECT_EXTENDED)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (primary.error && isMissingColumnError(primary.error.message)) {
    const fallback = await supabase
      .from("customer_requests")
      .select(REQUEST_SELECT_BASE)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    rows = (fallback.data ?? null) as RequestRowRaw[] | null;
    error = fallback.error;
  } else {
    rows = (primary.data ?? null) as RequestRowRaw[] | null;
    error = primary.error;
  }

  if (error || !rows) {
    if (error) console.error("[requests] getCustomerRequests:", error.message);
    return [];
  }

  return normalizeRequestRows(rows).map((row) =>
    mapRequestToCard(row, { viewerId: customerId })
  );
}

export async function getRequestById(
  id: string,
  viewerId?: string | null
): Promise<RequestDetail | null> {
  const supabase = await createClient();

  const runFetch = async (select: string) =>
    supabase.from("customer_requests").select(select).eq("id", id).maybeSingle();

  let row: RequestRowRaw | null = null;
  let error: { message: string } | null = null;

  const primary = await runFetch(REQUEST_SELECT_EXTENDED);

  if (primary.error && isMissingColumnError(primary.error.message)) {
    const fallback = await runFetch(REQUEST_SELECT_BASE);
    row = (fallback.data ?? null) as RequestRowRaw | null;
    error = fallback.error;
  } else {
    row = (primary.data ?? null) as RequestRowRaw | null;
    error = primary.error;
  }

  if (error || !row) {
    if (error) console.error("[requests] getRequestById:", error.message);
    return null;
  }

  const detail = mapRequestToDetail(normalizeRequestRow(row), {
    viewerId,
  });

  return enrichRequestWithMatchStatus(detail);
}

async function enrichRequestWithMatchStatus(
  detail: RequestDetail
): Promise<RequestDetail> {
  const supabase = await createClient();
  const { data: match } = await supabase
    .from("delivery_matches")
    .select("status")
    .eq("request_id", detail.id)
    .in("status", [
      "accepted",
      "deposit_pending",
      "deposit_held",
      "in_transit",
      "delivered",
      "completed",
    ])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!match || match.status === "pending" || match.status === "cancelled") {
    return detail;
  }

  if (detail.lifecycle === "pending") {
    return {
      ...detail,
      lifecycle: "accepted",
      lifecycleLabel: "Accepted",
      status: "matched",
    };
  }

  return detail;
}

function applyRequestSearchFilters(
  query: ReturnType<Awaited<ReturnType<typeof createClient>>["from"]>,
  params: RequestsSearchParams
) {
  let q = query;

  if (params.req_category) {
    q = q.eq("item_category", params.req_category);
  }

  if (
    params.req_urgency === "flexible" ||
    params.req_urgency === "normal" ||
    params.req_urgency === "urgent"
  ) {
    q = q.eq("urgency", params.req_urgency);
  }

  if (params.req_origin) {
    q = q.eq("preferred_origin_country_code", params.req_origin.toUpperCase());
  }

  if (params.req_city?.trim()) {
    q = q.ilike("preferred_origin_city", `%${params.req_city.trim()}%`);
  }

  if (params.req_q?.trim()) {
    const term = params.req_q.trim().replace(/[%_,]/g, "");
    if (term.length > 0) {
      q = q.or(
        `title.ilike.%${term}%,description.ilike.%${term}%,preferred_origin_city.ilike.%${term}%`
      );
    }
  }

  return q;
}

function applyRequestSort(
  query: ReturnType<Awaited<ReturnType<typeof createClient>>["from"]>,
  sort: RequestSort
) {
  switch (sort) {
    case "needed_by_asc":
      return query.order("needed_by", { ascending: true, nullsFirst: false });
    case "budget_desc":
      return query.order("max_budget", { ascending: false, nullsFirst: false });
    case "urgency":
      return query.order("urgency", { ascending: true });
    case "newest":
    default:
      return query.order("created_at", { ascending: false });
  }
}

export async function searchOpenRequests(
  params: RequestsSearchParams = {},
  limit = 48
): Promise<{ requests: RequestCardModel[]; total: number }> {
  const supabase = await createClient();
  const sort = (params.req_sort ?? "newest") as RequestSort;

  const buildQuery = (select: string, extended: boolean) => {
    let q = supabase
      .from("customer_requests")
      .select(select, { count: "exact" })
      .eq("status", "open");

    if (extended) {
      q = q.neq("lifecycle_status", "cancelled");
    }

    q = applyRequestSearchFilters(q, params);
    q = applyRequestSort(q, sort);
    return q.limit(limit);
  };

  let rows: RequestRowRaw[] | null = null;
  let error: { message: string } | null = null;
  let total = 0;

  const primary = await buildQuery(REQUEST_SELECT_EXTENDED, true);

  if (primary.error && isMissingColumnError(primary.error.message)) {
    const fallback = await buildQuery(REQUEST_SELECT_BASE, false);
    rows = (fallback.data ?? null) as RequestRowRaw[] | null;
    error = fallback.error;
    total = fallback.count ?? 0;
  } else {
    rows = (primary.data ?? null) as RequestRowRaw[] | null;
    error = primary.error;
    total = primary.count ?? 0;
  }

  if (error || !rows) {
    if (error) console.error("[requests] searchOpenRequests:", error.message);
    return { requests: [], total: 0 };
  }

  const normalized = normalizeRequestRows(rows);
  const withLifecycle = normalized.filter((r) => r.lifecycle_status !== "cancelled");

  return {
    requests: withLifecycle.map((row) => mapRequestToCard(row)),
    total: total || withLifecycle.length,
  };
}

/** @deprecated Use searchOpenRequests */
export async function getOpenRequestsForBrowse(
  limit = 12
): Promise<RequestCardModel[]> {
  const { requests } = await searchOpenRequests({}, limit);
  return requests;
}
