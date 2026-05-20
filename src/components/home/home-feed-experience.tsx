"use client";

import { HomeMatchesSummaryLive } from "@/components/home/home-matches-summary-live";
import { HomeModeFeed } from "@/components/home/home-mode-feed";
import type { AppMode } from "@/lib/mode/constants";
import type { ListingCardModel } from "@/types/listing";
import type { RequestCardModel } from "@/types/request";

type HomeFeedExperienceProps = {
  mode: AppMode;
  travelers: ListingCardModel[];
  requests: RequestCardModel[];
  sentCount: number;
  incomingCount: number;
  customerAcceptedCount: number;
  travelerAcceptedCount: number;
  userId: string;
};

export function HomeFeedExperience({
  mode,
  travelers,
  requests,
  sentCount,
  incomingCount,
  customerAcceptedCount,
  travelerAcceptedCount,
  userId,
}: HomeFeedExperienceProps) {
  return (
    <div className="space-y-6">
      <HomeMatchesSummaryLive
        mode={mode}
        userId={userId}
        initial={{
          sentCount,
          incomingCount,
          customerAcceptedCount,
          travelerAcceptedCount,
        }}
      />
      <HomeModeFeed
        mode={mode}
        travelers={travelers}
        requests={requests}
        userId={userId}
      />
    </div>
  );
}
