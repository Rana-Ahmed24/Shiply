import {
  dbStatusToDisplayStatus,
  MATCH_DISPLAY_LABELS,
} from "@/lib/matching/constants";
import type { CompatibilityFactor } from "@/types/match";
import type { MatchCardModel, MatchDetailModel } from "@/types/match";
import type { MatchRowRaw } from "@/lib/matching/db";

function parseFactors(
  raw: MatchRowRaw["compatibility_factors"]
): CompatibilityFactor[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as CompatibilityFactor[];
  return [];
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: currency || "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}

type MatchJoinMeta = {
  listingRoute: string;
  requestTitle: string;
  counterpartyName: string | null;
};

export function mapMatchToCard(
  row: MatchRowRaw,
  viewerId: string,
  meta: MatchJoinMeta
): MatchCardModel {
  const displayStatus = dbStatusToDisplayStatus(row.status, row.cancelled_at);
  const isInitiator = row.initiated_by === viewerId;
  const isRecipient =
    (row.customer_id === viewerId || row.traveler_id === viewerId) &&
    !isInitiator;

  return {
    id: row.id,
    href: `/matches/${row.id}`,
    displayStatus,
    displayStatusLabel: MATCH_DISPLAY_LABELS[displayStatus],
    agreedPriceLabel: formatPrice(Number(row.agreed_price), row.currency),
    compatibilityScore: row.compatibility_score,
    listingRoute: meta.listingRoute,
    requestTitle: meta.requestTitle,
    counterpartyName: meta.counterpartyName,
    isInitiator,
    createdAt: row.created_at,
    canAccept: row.status === "pending" && isRecipient,
    canReject: row.status === "pending",
    canComplete:
      row.status === "accepted" &&
      (row.traveler_id === viewerId || row.customer_id === viewerId),
  };
}

export function mapMatchToDetail(
  row: MatchRowRaw,
  viewerId: string,
  meta: MatchJoinMeta
): MatchDetailModel {
  const card = mapMatchToCard(row, viewerId, meta);
  return {
    ...card,
    listingId: row.listing_id,
    requestId: row.request_id,
    travelerId: row.traveler_id,
    customerId: row.customer_id,
    factors: parseFactors(row.compatibility_factors),
    cancellationReason: row.cancellation_reason,
  };
}
