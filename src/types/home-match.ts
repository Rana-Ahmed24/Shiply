import type { MatchCardModel } from "@/types/match";

/** Match row enriched for Home dashboard panels */
export type HomeMatchItem = MatchCardModel & {
  pickupLabel: string;
  destinationLabel: string;
  canCancel: boolean;
};
