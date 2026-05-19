/** User-facing match statuses (maps to delivery_matches.status in DB) */
export type MatchDisplayStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "completed";

export type DbMatchStatus =
  | "pending"
  | "accepted"
  | "deposit_pending"
  | "deposit_held"
  | "in_transit"
  | "delivered"
  | "completed"
  | "disputed"
  | "cancelled"
  | "refunded";

export type CompatibilityFactorKey =
  | "route"
  | "dates"
  | "category"
  | "capacity"
  | "verification";

export type CompatibilityFactor = {
  key: CompatibilityFactorKey;
  label: string;
  score: number;
  maxScore: number;
  passed: boolean;
  detail: string;
};

export type CompatibilityResult = {
  score: number;
  factors: CompatibilityFactor[];
  canMatch: boolean;
};

export type DeliveryMatchRow = {
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
  compatibility_factors: CompatibilityFactor[] | Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MatchCardModel = {
  id: string;
  href: string;
  displayStatus: MatchDisplayStatus;
  displayStatusLabel: string;
  agreedPriceLabel: string;
  compatibilityScore: number | null;
  listingRoute: string;
  requestTitle: string;
  counterpartyName: string | null;
  isInitiator: boolean;
  createdAt: string;
  canAccept: boolean;
  canReject: boolean;
  canCancel: boolean;
  canComplete: boolean;
};

export type MatchDetailModel = MatchCardModel & {
  listingId: string;
  requestId: string;
  travelerId: string;
  customerId: string;
  factors: CompatibilityFactor[];
  cancellationReason: string | null;
};
