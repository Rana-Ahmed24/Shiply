import { Suspense } from "react";

import { FlashMessageDialog } from "@/components/feedback/flash-message-dialog";
import { RequestFeedCard } from "@/components/feed/request-feed-card";
import { TravelerFeedCard } from "@/components/feed/traveler-feed-card";
import { RequestsFeedFilters } from "@/components/feed/requests-feed-filters";
import { ListingsFilters } from "@/components/listings/listings-filters";
import { HomeHeroDashboard } from "@/components/home/home-hero-dashboard";
import { HomeMatchesSummaryLive } from "@/components/home/home-matches-summary-live";
import { HomeQueryToast } from "@/components/home/home-query-toast";
import { ListingGridSkeleton } from "@/components/listings/listing-card-skeleton";
import type { AppMode } from "@/lib/mode/constants";
import { searchListings } from "@/lib/listings/queries";
import { searchOpenRequests } from "@/lib/requests/queries";
import type { ListingCardModel, ListingsSearchParams } from "@/types/listing";
import type { RequestsSearchParams } from "@/types/request";

type HomeDashboardProps = {
  userId: string;
  mode: AppMode;
  featuredListings: ListingCardModel[];
  listingsParams: ListingsSearchParams;
  requestParams: RequestsSearchParams;
  sentCount: number;
  incomingCount: number;
  customerAcceptedCount: number;
  travelerAcceptedCount: number;
  messageKey?: string;
};

async function RequestFeedResults({
  params,
  userId,
}: {
  params: RequestsSearchParams;
  userId: string;
}) {
  const { requests, total } = await searchOpenRequests(params, 48);

  if (requests.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/80 bg-muted px-6 py-16 text-center text-sm text-brand-muted">
        No open requests match your filters. Try adjusting search or post your own
        request.
      </p>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-brand-muted">
        {total} open request{total === 1 ? "" : "s"}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {requests.map((request) => (
          <RequestFeedCard
            key={request.id}
            request={request}
            currentUserId={userId}
          />
        ))}
      </div>
    </>
  );
}

async function TravelerFeedResults({ params }: { params: ListingsSearchParams }) {
  const result = await searchListings(params);
  const listings = result.listings;

  if (listings.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/80 bg-muted px-6 py-16 text-center text-sm text-brand-muted">
        No traveler listings match your filters. Try adjusting search or list your own
        trip.
      </p>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-brand-muted">
        {result.total} active listing{result.total === 1 ? "" : "s"}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <TravelerFeedCard key={listing.id} listing={listing} />
        ))}
      </div>
    </>
  );
}

export function HomeDashboard({
  userId,
  mode,
  featuredListings,
  listingsParams,
  requestParams,
  sentCount,
  incomingCount,
  customerAcceptedCount,
  travelerAcceptedCount,
  messageKey,
}: HomeDashboardProps) {
  return (
    <div className="mx-auto max-w-[1100px] space-y-0 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-10">
      <FlashMessageDialog messageKey={messageKey} />
      <HomeQueryToast />

      <HomeHeroDashboard featuredListings={featuredListings} />

      <div className="mt-8">
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
      </div>

      <hr className="my-0 border-border/60" />

      <section id="traveler-feed" className="scroll-mt-24 py-10 md:py-12">
        <div className="mb-6">
          <p className="text-section-label">Marketplace</p>
          <h2 className="text-section-title">Live Traveler Feed</h2>
          <p className="mt-2 text-sm font-light text-brand-muted">
            Browse verified travelers and find your perfect match
          </p>
        </div>

        <Suspense fallback={<div className="mb-6 h-32 animate-pulse rounded-xl bg-muted" />}>
          <ListingsFilters basePath="/" className="mb-6" />
        </Suspense>

        <Suspense
          key={JSON.stringify(listingsParams)}
          fallback={<ListingGridSkeleton count={6} />}
        >
          <TravelerFeedResults params={listingsParams} />
        </Suspense>
      </section>

      <hr className="border-border/60" />

      <section id="requests-feed" className="scroll-mt-24 py-10 md:py-12">
        <div className="mb-6">
          <p className="text-section-label">Marketplace</p>
          <h2 className="text-section-title">Live Customer Requests</h2>
          <p className="mt-2 text-sm font-light text-brand-muted">
            Open packages customers need delivered — offer your trip to carry them
          </p>
        </div>

        <Suspense fallback={<div className="mb-6 h-32 animate-pulse rounded-xl bg-muted" />}>
          <RequestsFeedFilters basePath="/" className="mb-6" />
        </Suspense>

        <Suspense
          key={JSON.stringify(requestParams)}
          fallback={<ListingGridSkeleton count={6} />}
        >
          <RequestFeedResults params={requestParams} userId={userId} />
        </Suspense>
      </section>
    </div>
  );
}
