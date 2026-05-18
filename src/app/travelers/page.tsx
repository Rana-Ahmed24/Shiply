import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { ListingGrid } from "@/components/listings/listing-grid";
import { ListingGridSkeleton } from "@/components/listings/listing-card-skeleton";
import { ListingsFilters } from "@/components/listings/listings-filters";
import { ListingsPagination } from "@/components/listings/listings-pagination";
import { searchListings } from "@/lib/listings/queries";
import type { ListingsSearchParams } from "@/types/listing";

type TravelersPageProps = {
  searchParams: Promise<ListingsSearchParams>;
};

async function ListingsResults({
  params,
}: {
  params: ListingsSearchParams;
}) {
  const result = await searchListings(params);

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {result.total} active listing{result.total === 1 ? "" : "s"}
      </p>
      <ListingGrid listings={result.listings} />
      <Suspense fallback={null}>
        <ListingsPagination
          page={result.page}
          totalPages={result.totalPages}
        />
      </Suspense>
    </>
  );
}

export default async function TravelersPage({ searchParams }: TravelersPageProps) {
  const params = await searchParams;

  return (
    <Container className="space-y-8 py-10 md:py-14">
      <div>
        <h1 className="text-display text-3xl md:text-4xl">Find travelers</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Browse upcoming trips into Egypt. Filter by route, category, and
          capacity to find the right traveler for your request.
        </p>
      </div>

      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-muted/50" />}>
        <ListingsFilters />
      </Suspense>

      <Suspense
        key={JSON.stringify(params)}
        fallback={<ListingGridSkeleton count={6} />}
      >
        <ListingsResults params={params} />
      </Suspense>
    </Container>
  );
}
