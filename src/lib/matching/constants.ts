import type { DbMatchStatus, MatchDisplayStatus } from "@/types/match";

/** Minimum score (0–100) required to create a match */
export const MIN_COMPATIBILITY_SCORE = 50;

export const PLATFORM_FEE_RATE = 0.05;

export const DEFAULT_AGREED_PRICE_EGP = 500;

export const MATCH_DISPLAY_LABELS: Record<MatchDisplayStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  rejected: "Rejected",
  completed: "Completed",
};

export function dbStatusToDisplayStatus(
  status: DbMatchStatus,
  cancelledAt: string | null
): MatchDisplayStatus {
  if (status === "cancelled" || (cancelledAt && status === "pending")) {
    return "rejected";
  }
  if (status === "completed") {
    return "completed";
  }
  if (
    status === "accepted" ||
    status === "deposit_pending" ||
    status === "deposit_held" ||
    status === "in_transit" ||
    status === "delivered"
  ) {
    return "accepted";
  }
  return "requested";
}

export const ACTIVE_MATCH_STATUSES: DbMatchStatus[] = [
  "pending",
  "accepted",
  "deposit_pending",
  "deposit_held",
  "in_transit",
  "delivered",
];
