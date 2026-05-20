import { redirect } from "next/navigation";

import { HomeDashboard } from "@/components/home/home-dashboard";
import { HeroSection } from "@/components/marketing/hero-section";
import { LiveListings } from "@/components/marketing/live-listings";
import { needsOnboarding } from "@/lib/auth/profile";
import { getSession } from "@/lib/auth/server";
import {
  countAcceptedForCustomer,
  countAcceptedForTraveler,
  countPendingIncomingForTraveler,
  countSentPendingForCustomer,
} from "@/lib/matching/queries";
import { getAppMode } from "@/lib/mode/server";
import type { AppMode } from "@/lib/mode/constants";
import { getHeroListingPreviews } from "@/lib/listings/hero-listings";
import { parseRequestsSearchParams } from "@/lib/requests/search-params";
import type { ListingsSearchParams } from "@/types/listing";
import type { RequestsSearchParams } from "@/types/request";

type PageProps = {
  searchParams: Promise<
    ListingsSearchParams & RequestsSearchParams & { message?: string }
  >;
};

/** Public landing for guests; signed-in dashboard at `/` after onboarding. */
export default async function RootPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getSession();

  if (!session) {
    return (
      <>
        <HeroSection listings={<LiveListings />} />
      </>
    );
  }

  if (needsOnboarding(session.user, session.profile)) {
    redirect("/onboarding");
  }

  const profilePreferred =
    (session.profile?.preferred_mode as AppMode | undefined) ?? "customer";
  const mode = await getAppMode(profilePreferred);
  const userId = session.profile!.id;

  const { message, ...rest } = params;
  const listingParams: ListingsSearchParams = rest;
  const requestParams = parseRequestsSearchParams(rest);

  const [
    featuredListings,
    incomingCount,
    sentCount,
    customerAcceptedCount,
    travelerAcceptedCount,
  ] = await Promise.all([
    getHeroListingPreviews(3),
    countPendingIncomingForTraveler(userId),
    countSentPendingForCustomer(userId),
    countAcceptedForCustomer(userId),
    countAcceptedForTraveler(userId),
  ]);

  return (
    <HomeDashboard
      userId={userId}
      mode={mode}
      featuredListings={featuredListings}
      listingsParams={listingParams}
      requestParams={requestParams}
      sentCount={sentCount}
      incomingCount={incomingCount}
      customerAcceptedCount={customerAcceptedCount}
      travelerAcceptedCount={travelerAcceptedCount}
      messageKey={message}
    />
  );
}
