import "server-only";

import { mapVerificationRow } from "@/lib/verification/mappers";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminVerificationQueueItem,
  TravelerVerificationRow,
  TravelerVerificationStatus,
  TravelerVerificationView,
} from "@/types/traveler-verification";

function isMissingTableError(message: string): boolean {
  return (
    message.includes("traveler_verifications") &&
    (message.includes("does not exist") || message.includes("schema cache"))
  );
}

export async function getTravelerVerification(
  userId: string
): Promise<TravelerVerificationView> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("traveler_verifications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && !isMissingTableError(error.message)) {
    console.error("[verification] getTravelerVerification:", error.message);
  }

  return mapVerificationRow(
    (data as TravelerVerificationRow | null) ?? null,
    userId
  );
}

export async function countUserListings(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("traveler_listings")
    .select("id", { count: "exact", head: true })
    .eq("traveler_id", userId);

  if (error) {
    console.error("[verification] countUserListings:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function fetchVerifiedTravelerIds(
  travelerIds: string[]
): Promise<Set<string>> {
  if (travelerIds.length === 0) return new Set();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("traveler_verifications")
    .select("user_id")
    .in("user_id", travelerIds)
    .eq("status", "verified");

  if (error) {
    if (isMissingTableError(error.message)) {
      return fetchLegacyVerifiedTravelerIds(travelerIds);
    }
    console.error("[verification] fetchVerifiedTravelerIds:", error.message);
    return new Set();
  }

  return new Set((data ?? []).map((r) => r.user_id as string));
}

async function fetchLegacyVerifiedTravelerIds(
  travelerIds: string[]
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("verifications")
    .select("user_id")
    .in("user_id", travelerIds)
    .eq("status", "approved")
    .in("type", ["passport", "government_id", "flight_itinerary"]);

  return new Set((data ?? []).map((v) => v.user_id as string));
}

export async function fetchVerificationStatusMap(
  travelerIds: string[]
): Promise<Map<string, TravelerVerificationStatus>> {
  const map = new Map<string, TravelerVerificationStatus>();
  if (travelerIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("traveler_verifications")
    .select("user_id, status")
    .in("user_id", travelerIds);

  if (error) {
    if (!isMissingTableError(error.message)) {
      console.error("[verification] fetchVerificationStatusMap:", error.message);
    }
    return map;
  }

  for (const row of data ?? []) {
    map.set(row.user_id as string, row.status as TravelerVerificationStatus);
  }
  return map;
}

export async function getAdminVerificationQueue(): Promise<
  AdminVerificationQueueItem[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("traveler_verifications")
    .select(
      "id, user_id, status, rejection_reason, created_at, passport_url, selfie_url, ticket_url"
    )
    .in("status", ["pending", "verified", "rejected"])
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    console.error("[verification] getAdminVerificationQueue:", error.message);
    return [];
  }

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const userIds = [...new Set(rows.map((r) => r.user_id as string))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      p.id as string,
      { fullName: p.full_name as string | null, email: p.email as string },
    ])
  );

  return rows.map((row) => {
    const p = profileMap.get(row.user_id as string);
    return {
      id: row.id as string,
      userId: row.user_id as string,
      fullName: p?.fullName ?? null,
      email: p?.email ?? "",
      status: row.status as TravelerVerificationStatus,
      rejectionReason: row.rejection_reason as string | null,
      createdAt: row.created_at as string,
      passportPath: row.passport_url as string | null,
      selfiePath: row.selfie_url as string | null,
      ticketPath: row.ticket_url as string | null,
    };
  });
}

/** Signed URLs for admin review (service role not required — admin RLS on storage). */
export async function getAdminSignedDocUrls(
  item: Pick<
    AdminVerificationQueueItem,
    "passportPath" | "selfiePath" | "ticketPath"
  >
): Promise<{ passport: string | null; selfie: string | null; ticket: string | null }> {
  const { createSignedVerificationUrl } = await import(
    "@/lib/verification/storage"
  );
  const supabase = await createClient();

  const [passport, selfie, ticket] = await Promise.all([
    item.passportPath
      ? createSignedVerificationUrl(supabase, item.passportPath)
      : null,
    item.selfiePath
      ? createSignedVerificationUrl(supabase, item.selfiePath)
      : null,
    item.ticketPath
      ? createSignedVerificationUrl(supabase, item.ticketPath)
      : null,
  ]);

  return { passport, selfie, ticket };
}
