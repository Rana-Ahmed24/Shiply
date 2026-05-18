import type { SupabaseClient } from "@supabase/supabase-js";

import { isMissingColumnError } from "@/lib/profile/db";
import type { Database } from "@/types/database";
import type { CustomerRequestRow, RequestLifecycle } from "@/types/request";

type Supabase = SupabaseClient<Database>;

export const REQUEST_SELECT_BASE = `
  id,
  customer_id,
  title,
  description,
  item_category,
  estimated_weight_kg,
  max_budget,
  currency,
  preferred_origin_country_code,
  preferred_origin_city,
  needed_by,
  status,
  published_at,
  expires_at,
  created_at,
  updated_at
`;

export const REQUEST_SELECT_EXTENDED = `
  id,
  customer_id,
  title,
  description,
  item_category,
  estimated_weight_kg,
  max_budget,
  currency,
  preferred_origin_country_code,
  preferred_origin_city,
  needed_by,
  status,
  product_link,
  urgency,
  image_urls,
  lifecycle_status,
  published_at,
  expires_at,
  created_at,
  updated_at
`;

export type RequestRowRaw = Omit<
  CustomerRequestRow,
  "product_link" | "urgency" | "image_urls" | "lifecycle_status"
> & {
  product_link?: string | null;
  urgency?: CustomerRequestRow["urgency"] | null;
  image_urls?: string[] | null;
  lifecycle_status?: RequestLifecycle | null;
};

export function normalizeRequestRow(row: RequestRowRaw): CustomerRequestRow {
  const lifecycle = row.lifecycle_status ?? lifecycleFromLegacyStatus(row.status);
  return {
    ...row,
    product_link: row.product_link ?? null,
    urgency: row.urgency ?? "normal",
    image_urls: row.image_urls ?? [],
    lifecycle_status: lifecycle,
  } as CustomerRequestRow;
}

export function normalizeRequestRows(rows: RequestRowRaw[]): CustomerRequestRow[] {
  return rows.map(normalizeRequestRow);
}

function lifecycleFromLegacyStatus(
  status: CustomerRequestRow["status"]
): RequestLifecycle {
  switch (status) {
    case "matched":
      return "accepted";
    case "in_progress":
      return "purchased";
    case "fulfilled":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

type RequestInsert = Database["public"]["Tables"]["customer_requests"]["Insert"];

export function stripExtendedRequestFields(
  payload: RequestInsert
): Omit<
  RequestInsert,
  "product_link" | "urgency" | "image_urls" | "lifecycle_status"
> {
  const rest = { ...payload };
  delete (rest as Partial<RequestInsert>).product_link;
  delete (rest as Partial<RequestInsert>).urgency;
  delete (rest as Partial<RequestInsert>).image_urls;
  delete (rest as Partial<RequestInsert>).lifecycle_status;
  return rest as Omit<
    RequestInsert,
    "product_link" | "urgency" | "image_urls" | "lifecycle_status"
  >;
}

export async function insertRequest(supabase: Supabase, payload: RequestInsert) {
  const extended = await supabase
    .from("customer_requests")
    .insert(payload)
    .select("id")
    .single();

  if (!extended.error) return extended;

  if (!isMissingColumnError(extended.error.message)) {
    return extended;
  }

  return supabase
    .from("customer_requests")
    .insert(stripExtendedRequestFields(payload))
    .select("id")
    .single();
}

export async function deleteRequest(supabase: Supabase, requestId: string) {
  return supabase.from("customer_requests").delete().eq("id", requestId);
}

export async function updateRequestImageUrls(
  supabase: Supabase,
  requestId: string,
  imageUrls: string[]
) {
  const { error } = await supabase
    .from("customer_requests")
    .update({ image_urls: imageUrls })
    .eq("id", requestId);

  if (!error) return { error: null };

  if (isMissingColumnError(error.message)) {
    return { error: new Error("image_urls column missing on customer_requests") };
  }

  return { error };
}

export async function updateRequest(
  supabase: Supabase,
  requestId: string,
  payload: RequestInsert
) {
  const extended = await supabase
    .from("customer_requests")
    .update(payload)
    .eq("id", requestId);

  if (!extended.error) return extended;

  if (!isMissingColumnError(extended.error.message)) {
    return extended;
  }

  return supabase
    .from("customer_requests")
    .update(stripExtendedRequestFields(payload))
    .eq("id", requestId);
}
