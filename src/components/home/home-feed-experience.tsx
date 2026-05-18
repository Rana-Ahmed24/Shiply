"use client";

import { HomeFeedTabs } from "@/components/feeds/home-feed-tabs";
import type { AppMode } from "@/lib/mode/constants";
import type { ListingCardModel } from "@/types/listing";
import type { RequestCardModel } from "@/types/request";

type HomeFeedExperienceProps = {
  mode: AppMode;
  travelers: ListingCardModel[];
  requests: RequestCardModel[];
};

export function HomeFeedExperience({
  mode,
  travelers,
  requests,
}: HomeFeedExperienceProps) {
  return (
    <HomeFeedTabs mode={mode} travelers={travelers} requests={requests} />
  );
}
