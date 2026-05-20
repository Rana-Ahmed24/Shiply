import "server-only";

import { LIVE_LISTINGS } from "@/data/mock-listings";
import { mockListingToCard } from "@/lib/listings/mappers";
import { getFeaturedListings } from "@/lib/listings/queries";
import type { ListingCardModel } from "@/types/listing";

/** Active listings for hero preview, with mock fallback when the feed is empty. */
export async function getHeroListingPreviews(
  limit = 3
): Promise<ListingCardModel[]> {
  const fromDb = await getFeaturedListings(limit);
  if (fromDb.length > 0) return fromDb;

  return LIVE_LISTINGS.slice(0, limit).map((listing) =>
    mockListingToCard({ ...listing, id: listing.id })
  );
}
