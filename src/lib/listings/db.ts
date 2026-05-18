import type { SupabaseClient } from "@supabase/supabase-js";

import { isMissingColumnError } from "@/lib/profile/db";
import type { Database } from "@/types/database";
import type { TravelerListingRow } from "@/types/listing";

type Supabase = SupabaseClient<Database>;

export const LISTING_SELECT_BASE = `
  id,
  traveler_id,
  origin_city,
  origin_country_code,
  destination_city,
  destination_country_code,
  departure_at,
  arrival_at,
  available_weight_kg,
  service_type,
  accepted_categories,
  notes,
  status,
  published_at,
  expires_at,
  view_count,
  created_at,
  updated_at
`;

export const LISTING_SELECT_EXTENDED = `${LISTING_SELECT_BASE.replace(
  "notes,",
  "notes,\n  delivery_preferences,"
)}`;

export type ListingRowRaw = Omit<TravelerListingRow, "delivery_preferences"> & {
  delivery_preferences?: string[] | null;
};

export function normalizeListingRow(row: ListingRowRaw): TravelerListingRow {
  return {
    ...row,
    delivery_preferences: row.delivery_preferences ?? [],
  };
}

export function normalizeListingRows(rows: ListingRowRaw[]): TravelerListingRow[] {
  return rows.map(normalizeListingRow);
}

type ListingWritePayload = Database["public"]["Tables"]["traveler_listings"]["Insert"];

export function stripDeliveryPreferences(
  payload: ListingWritePayload
): Omit<ListingWritePayload, "delivery_preferences"> {
  const rest = { ...payload };
  delete (rest as Partial<ListingWritePayload>).delivery_preferences;
  return rest as Omit<ListingWritePayload, "delivery_preferences">;
}

export async function insertListing(
  supabase: Supabase,
  payload: ListingWritePayload
) {
  const extended = await supabase
    .from("traveler_listings")
    .insert(payload)
    .select("id")
    .single();

  if (!extended.error) return extended;

  if (!isMissingColumnError(extended.error.message)) {
    return extended;
  }

  return supabase
    .from("traveler_listings")
    .insert(stripDeliveryPreferences(payload))
    .select("id")
    .single();
}

export async function updateListing(
  supabase: Supabase,
  listingId: string,
  payload: ListingWritePayload
) {
  const extended = await supabase
    .from("traveler_listings")
    .update(payload)
    .eq("id", listingId);

  if (!extended.error) return extended;

  if (!isMissingColumnError(extended.error.message)) {
    return extended;
  }

  return supabase
    .from("traveler_listings")
    .update(stripDeliveryPreferences(payload))
    .eq("id", listingId);
}
