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
import type { RequestCardModel, RequestDetail } from "@/types/request";

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

  return mapRequestToDetail(normalizeRequestRow(row), {
    viewerId,
  });
}

export async function getOpenRequestsForBrowse(
  limit = 12
): Promise<RequestCardModel[]> {
  const supabase = await createClient();

  let rows: RequestRowRaw[] | null = null;
  let error: { message: string } | null = null;

  const primary = await supabase
    .from("customer_requests")
    .select(REQUEST_SELECT_EXTENDED)
    .eq("status", "open")
    .neq("lifecycle_status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (primary.error && isMissingColumnError(primary.error.message)) {
    const fallback = await supabase
      .from("customer_requests")
      .select(REQUEST_SELECT_BASE)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(limit);
    rows = (fallback.data ?? null) as RequestRowRaw[] | null;
    error = fallback.error;
  } else {
    rows = (primary.data ?? null) as RequestRowRaw[] | null;
    error = primary.error;
  }

  if (error || !rows) {
    if (error) console.error("[requests] getOpenRequestsForBrowse:", error.message);
    return [];
  }

  return normalizeRequestRows(rows).map((row) =>
    mapRequestToCard(row)
  );
}
