import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import {
  TRAVELER_VERIFICATION_BUCKET,
  verificationPathMatchesKind,
} from "@/lib/verification/constants";
import type { TravelerVerificationDocKind } from "@/types/traveler-verification";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  TravelerVerificationRow,
  TravelerVerificationStatus,
} from "@/types/traveler-verification";

export type VerificationIntegrityResult = {
  userId: string;
  dbStatus: TravelerVerificationStatus;
  passport: boolean;
  selfie: boolean;
  ticket: boolean;
  paths: {
    passport: string | null;
    selfie: string | null;
    ticket: string | null;
  };
  filesExist: {
    passport: boolean;
    selfie: boolean;
    ticket: boolean;
  };
  allPathsPresent: boolean;
  allFilesExist: boolean;
  isVerified: boolean;
  repaired: boolean;
};

function logIntegrityDebug(result: VerificationIntegrityResult) {
  console.log("[verification]");
  console.log("status:", result.dbStatus);
  console.log("passport:", result.passport);
  console.log("selfie:", result.selfie);
  console.log("ticket:", result.ticket);
  console.log("filesExist:", result.filesExist);
  console.log("finalResult:", result.isVerified ? "verified" : "not_verified");
}

function isStorageNotFoundError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("not found") ||
    m.includes("object not found") ||
    m.includes("does not exist")
  );
}

async function storageObjectExists(
  client: Awaited<ReturnType<typeof createClient>>,
  path: string
): Promise<boolean> {
  const { data, error } = await client.storage
    .from(TRAVELER_VERIFICATION_BUCKET)
    .download(path);

  if (!error && data) return true;
  if (error && isStorageNotFoundError(error.message)) return false;
  if (error) {
    console.warn("[verification] storage check:", path, error.message);
  }
  return false;
}

async function fetchVerificationRow(
  userId: string,
  existing?: TravelerVerificationRow | null
): Promise<TravelerVerificationRow | null> {
  if (existing !== undefined) return existing;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("traveler_verifications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[verification] fetch row:", error.message);
    return null;
  }
  return (data as TravelerVerificationRow | null) ?? null;
}

/**
 * Ensures verified status matches DB paths and real storage objects.
 * Optionally repairs DB (status → invalid) when files are missing.
 */
export async function checkTravelerVerificationIntegrity(
  userId: string,
  options?: {
    repair?: boolean;
    row?: TravelerVerificationRow | null;
    log?: boolean;
  }
): Promise<VerificationIntegrityResult> {
  noStore();

  const repair = options?.repair ?? true;
  const shouldLog = options?.log ?? process.env.NODE_ENV !== "production";

  const row = await fetchVerificationRow(userId, options?.row);
  const dbStatus: TravelerVerificationStatus = row?.status ?? "not_submitted";

  const paths = {
    passport: row?.passport_url ?? null,
    selfie: row?.selfie_url ?? null,
    ticket: row?.ticket_url ?? null,
  };

  const passport = Boolean(paths.passport);
  const selfie = Boolean(paths.selfie);
  const ticket = Boolean(paths.ticket);
  const allPathsPresent = passport && selfie && ticket;

  let storageClient: Awaited<ReturnType<typeof createClient>>;
  try {
    storageClient = createAdminClient();
  } catch {
    storageClient = await createClient();
  }

  async function docExists(
    path: string | null,
    kind: TravelerVerificationDocKind
  ): Promise<boolean> {
    if (!path || !verificationPathMatchesKind(path, kind)) return false;
    return storageObjectExists(storageClient, path);
  }

  const filesExist = {
    passport: await docExists(paths.passport, "passport"),
    selfie: await docExists(paths.selfie, "selfie"),
    ticket: await docExists(paths.ticket, "ticket"),
  };

  const allFilesExist =
    filesExist.passport && filesExist.selfie && filesExist.ticket;

  const isVerified =
    dbStatus === "verified" && allPathsPresent && allFilesExist;

  let repaired = false;
  let effectiveStatus = dbStatus;

  const pathClears: {
    passport_url?: null;
    selfie_url?: null;
    ticket_url?: null;
  } = {};
  if (paths.passport && !filesExist.passport) pathClears.passport_url = null;
  if (paths.selfie && !filesExist.selfie) pathClears.selfie_url = null;
  if (paths.ticket && !filesExist.ticket) pathClears.ticket_url = null;

  const needsPathRepair = Object.keys(pathClears).length > 0;
  const needsStatusRepair = dbStatus === "verified" && !isVerified;

  if (repair && row && (needsPathRepair || needsStatusRepair)) {
    try {
      const admin = createAdminClient();
      const updates: Record<string, unknown> = { ...pathClears };
      if (needsStatusRepair) {
        updates.status = "invalid";
        updates.reviewed_by = null;
        updates.reviewed_at = null;
        effectiveStatus = "invalid";
      }
      const { error } = await admin
        .from("traveler_verifications")
        .update(updates)
        .eq("id", row.id);

      if (!error) {
        repaired = true;
        if (needsPathRepair) {
          console.warn(
            `[verification] Cleared stale document paths for user ${userId}`
          );
        }
      } else {
        console.error("[verification] repair failed:", error.message);
      }
    } catch (err) {
      console.error(
        "[verification] repair skipped (no service role):",
        err instanceof Error ? err.message : err
      );
    }
  }

  const result: VerificationIntegrityResult = {
    userId,
    dbStatus: effectiveStatus,
    passport,
    selfie,
    ticket,
    paths,
    filesExist,
    allPathsPresent,
    allFilesExist,
    isVerified: repaired ? false : isVerified,
    repaired,
  };

  if (shouldLog) logIntegrityDebug(result);

  return result;
}

/** Batch integrity for marketplace verified badges (no stale cache). */
export async function filterVerifiedTravelerIds(
  travelerIds: string[]
): Promise<Set<string>> {
  noStore();
  if (travelerIds.length === 0) return new Set();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("traveler_verifications")
    .select("*")
    .in("user_id", travelerIds)
    .eq("status", "verified");

  if (error) {
    console.error("[verification] filterVerifiedTravelerIds:", error.message);
    return new Set();
  }

  const verified = new Set<string>();
  const rows = (data ?? []) as TravelerVerificationRow[];

  await Promise.all(
    rows.map(async (row) => {
      const integrity = await checkTravelerVerificationIntegrity(row.user_id, {
        repair: true,
        row,
        log: false,
      });
      if (integrity.isVerified) verified.add(row.user_id);
    })
  );

  return verified;
}

export function isTravelerVerificationStatusVerified(
  status: TravelerVerificationStatus
): boolean {
  return status === "verified";
}
