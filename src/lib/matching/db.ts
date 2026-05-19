import type { SupabaseClient } from "@supabase/supabase-js";

import { isMissingColumnError } from "@/lib/profile/db";
import type { CompatibilityFactor } from "@/types/match";
import type { DbMatchStatus } from "@/types/match";

export const MATCH_SELECT =
  "id, listing_id, request_id, traveler_id, customer_id, agreed_price, currency, platform_fee_amount, status, initiated_by, accepted_at, completed_at, cancelled_at, cancellation_reason, compatibility_score, compatibility_factors, created_at, updated_at";

export type MatchRowRaw = {
  id: string;
  listing_id: string;
  request_id: string;
  traveler_id: string;
  customer_id: string;
  agreed_price: number;
  currency: string;
  platform_fee_amount: number;
  status: DbMatchStatus;
  initiated_by: string;
  accepted_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  compatibility_score: number | null;
  compatibility_factors: CompatibilityFactor[] | Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type InsertMatch = {
  listing_id: string;
  request_id: string;
  traveler_id: string;
  customer_id: string;
  agreed_price: number;
  currency: string;
  platform_fee_amount: number;
  initiated_by: string;
  compatibility_score?: number;
  compatibility_factors?: CompatibilityFactor[];
};

export async function insertMatch(
  supabase: SupabaseClient,
  row: InsertMatch
): Promise<{ data: MatchRowRaw | null; error: string | null }> {
  const withCompat = {
    ...row,
    status: "pending" as const,
    compatibility_factors: row.compatibility_factors ?? [],
  };

  let result = await supabase
    .from("delivery_matches")
    .insert(withCompat)
    .select(MATCH_SELECT)
    .single();

  if (result.error && isMissingColumnError(result.error.message)) {
    const { compatibility_score: _s, compatibility_factors: _f, ...base } =
      withCompat;
    result = await supabase
      .from("delivery_matches")
      .insert(base)
      .select(MATCH_SELECT)
      .single();
  }

  if (result.error) {
    return { data: null, error: result.error.message };
  }

  return { data: result.data as MatchRowRaw, error: null };
}

export async function updateMatchById(
  supabase: SupabaseClient,
  id: string,
  patch: Record<string, unknown>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("delivery_matches")
    .update(patch)
    .eq("id", id);

  return { error: error?.message ?? null };
}
