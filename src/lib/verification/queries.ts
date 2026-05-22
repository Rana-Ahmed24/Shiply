import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";

import { hasRole, type UserRole } from "@/lib/auth/roles";
import {
  checkTravelerVerificationIntegrity,
  filterVerifiedTravelerIds,
} from "@/lib/verification/integrity";
import {
  applyIntegrityToVerificationView,
  mapVerificationRow,
} from "@/lib/verification/mappers";
import { createAdminClient } from "@/lib/supabase/admin";
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

export const getTravelerVerification = cache(
  async (userId: string): Promise<TravelerVerificationView> => {
    noStore();

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("traveler_verifications")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && !isMissingTableError(error.message)) {
      console.error("[verification] getTravelerVerification:", error.message);
    }

    const row = (data as TravelerVerificationRow | null) ?? null;

    let effectiveRow = row;
    let integrity = await checkTravelerVerificationIntegrity(userId, {
      repair: true,
      row: effectiveRow,
      log: false,
    });

    if (integrity.repaired) {
      const { data: refreshed } = await supabase
        .from("traveler_verifications")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      effectiveRow = (refreshed as TravelerVerificationRow | null) ?? row;
      integrity = await checkTravelerVerificationIntegrity(userId, {
        repair: false,
        row: effectiveRow,
        log: false,
      });
    }

    const view = mapVerificationRow(effectiveRow, userId);
    return applyIntegrityToVerificationView(view, integrity);
  }
);

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

/** True only when DB status is verified and all storage files exist. */
export async function isTravelerVerifiedById(travelerId: string): Promise<boolean> {
  noStore();
  const ids = await fetchVerifiedTravelerIds([travelerId]);
  return ids.has(travelerId);
}

export async function fetchVerifiedTravelerIds(
  travelerIds: string[]
): Promise<Set<string>> {
  return filterVerifiedTravelerIds(travelerIds);
}

export async function fetchVerificationStatusMap(
  travelerIds: string[]
): Promise<Map<string, TravelerVerificationStatus>> {
  noStore();
  const map = new Map<string, TravelerVerificationStatus>();
  if (travelerIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("traveler_verifications")
    .select("*")
    .in("user_id", travelerIds);

  if (error && !isMissingTableError(error.message)) {
    console.error("[verification] fetchVerificationStatusMap:", error.message);
  }

  const rows = (data ?? []) as TravelerVerificationRow[];

  await Promise.all(
    rows.map(async (row) => {
      const integrity = await checkTravelerVerificationIntegrity(row.user_id, {
        repair: true,
        row,
        log: false,
      });
      map.set(
        row.user_id,
        integrity.isVerified ? "verified" : integrity.dbStatus
      );
    })
  );

  for (const id of travelerIds) {
    if (!map.has(id)) map.set(id, "not_submitted");
  }

  return map;
}

async function getAdminQueueClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .maybeSingle();

  if (!hasRole(profile?.roles as UserRole[] | undefined, "admin")) {
    return null;
  }

  try {
    return createAdminClient();
  } catch {
    return supabase;
  }
}

export async function getAdminVerificationQueue(): Promise<
  AdminVerificationQueueItem[]
> {
  noStore();

  const supabase = await getAdminQueueClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("traveler_verifications")
    .select(
      "id, user_id, status, rejection_reason, created_at, passport_url, selfie_url, ticket_url"
    )
    .in("status", ["pending", "verified", "rejected", "invalid"])
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

  const items = rows.map((row) => {
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
      previewUrls: {
        passport: null as string | null,
        selfie: null as string | null,
        ticket: null as string | null,
      },
    };
  });

  await Promise.all(
    items.map(async (item) => {
      item.previewUrls = await getAdminSignedDocUrls(item, supabase);
    })
  );

  return items;
}

/** Signed URLs for admin review (prefer service-role client when available). */
export async function getAdminSignedDocUrls(
  item: Pick<
    AdminVerificationQueueItem,
    "passportPath" | "selfiePath" | "ticketPath"
  >,
  supabaseClient?: Awaited<ReturnType<typeof createClient>>
): Promise<{ passport: string | null; selfie: string | null; ticket: string | null }> {
  const { createSignedVerificationUrl } = await import(
    "@/lib/verification/storage"
  );
  const supabase = supabaseClient ?? (await createClient());

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
