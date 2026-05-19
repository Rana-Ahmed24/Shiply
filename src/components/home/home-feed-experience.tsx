"use client";

import { HomeMatchesSummary } from "@/components/home/home-matches-summary";
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
};

export function HomeFeedExperience({
  mode,
  travelers,
  requests,
  sentCount,
  incomingCount,
}: HomeFeedExperienceProps) {
  return (
    <div className="space-y-6">
      <HomeMatchesSummary
        mode={mode}
        sentCount={sentCount}
        incomingCount={incomingCount}
      />
      <HomeModeFeed mode={mode} travelers={travelers} requests={requests} />
    </div>
  );
}
