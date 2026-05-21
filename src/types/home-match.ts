import type { MatchCardModel } from "@/types/match";

/** Match row enriched for lists and accepted-state UI */
export type HomeMatchItem = MatchCardModel & {
  pickupLabel: string;
  destinationLabel: string;
  canCancel: boolean;
  listingId: string;
  requestId: string;
  customerId: string;
  travelerId: string;
  acceptedAt: string | null;
  acceptedAtLabel: string | null;
  estimatedArrivalLabel: string | null;
  isViewerCustomer: boolean;
  isViewerTraveler: boolean;
  travelerName: string | null;
  customerName: string | null;
  travelerVerified: boolean;
};

export type MatchesFeed = {
  sent: HomeMatchItem[];
  incoming: HomeMatchItem[];
  accepted: HomeMatchItem[];
  sentCount: number;
  incomingCount: number;
  acceptedCount: number;
  customerAcceptedCount: number;
  travelerAcceptedCount: number;
};
