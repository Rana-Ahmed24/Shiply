import { HomeDashboardHeader } from "@/components/home/home-dashboard-header";
import { HomeFeedExperience } from "@/components/home/home-feed-experience";
import { Container } from "@/components/layout/container";
import { requireSession } from "@/lib/auth/server";
import { searchListings } from "@/lib/listings/queries";
import { getAppMode } from "@/lib/mode/server";
import type { AppMode } from "@/lib/mode/constants";
import { getOpenRequestsForBrowse } from "@/lib/requests/queries";

export default async function HomePage() {
  const { profile } = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/home")}`
  );

  const profilePreferred =
    (profile?.preferred_mode as AppMode | undefined) ?? "customer";
  const mode = await getAppMode(profilePreferred);

  const [travelersResult, requests] = await Promise.all([
    searchListings({ sort: "arrival_asc", page: "1" }),
    getOpenRequestsForBrowse(24),
  ]);

  return (
    <Container className="max-w-6xl space-y-6 py-6 pb-24 md:space-y-8 md:py-8 md:pb-10">
      <HomeDashboardHeader mode={mode} />
      <HomeFeedExperience
        mode={mode}
        travelers={travelersResult.listings}
        requests={requests}
      />
    </Container>
  );
}
