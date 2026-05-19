import { FlashMessageDialog } from "@/components/feedback/flash-message-dialog";
import { HomeDashboardHeader } from "@/components/home/home-dashboard-header";
import { HomeFeedExperience } from "@/components/home/home-feed-experience";
import { HomeQueryToast } from "@/components/home/home-query-toast";
import { Container } from "@/components/layout/container";
import { requireSession } from "@/lib/auth/server";
import { searchListings } from "@/lib/listings/queries";
import {
  countPendingIncomingForTraveler,
  countSentMatchesForCustomer,
} from "@/lib/matching/queries";
import { getAppMode } from "@/lib/mode/server";
import type { AppMode } from "@/lib/mode/constants";
import { getOpenRequestsForBrowse } from "@/lib/requests/queries";

type HomePageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const { profile } = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/home")}`
  );

  const profilePreferred =
    (profile?.preferred_mode as AppMode | undefined) ?? "customer";
  const mode = await getAppMode(profilePreferred);

  const userId = profile!.id;

  const [travelersResult, requests, incomingCount, sentCount] = await Promise.all([
    searchListings({ sort: "arrival_asc", page: "1" }),
    getOpenRequestsForBrowse(24),
    countPendingIncomingForTraveler(userId),
    countSentMatchesForCustomer(userId),
  ]);

  return (
    <Container className="max-w-6xl space-y-6 py-6 pb-24 md:space-y-8 md:py-8 md:pb-10">
      <FlashMessageDialog messageKey={params.message} />
      <HomeQueryToast />
      <HomeDashboardHeader mode={mode} />
      <HomeFeedExperience
        mode={mode}
        travelers={travelersResult.listings}
        requests={requests}
        sentCount={sentCount}
        incomingCount={incomingCount}
      />
    </Container>
  );
}
