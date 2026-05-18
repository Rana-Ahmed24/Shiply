import { ListingCard } from "@/components/listings/listing-card";
import { LIVE_LISTINGS } from "@/data/mock-listings";
import { mockListingToCard } from "@/lib/listings/mappers";
import { getFeaturedListings } from "@/lib/listings/queries";

export async function LiveListings() {
  const fromDb = await getFeaturedListings();
  const listings =
    fromDb.length > 0
      ? fromDb
      : LIVE_LISTINGS.map((l) => mockListingToCard({ ...l, id: l.id }));

  return (
    <section aria-labelledby="live-listings-heading">
      <h2
        id="live-listings-heading"
        className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground"
      >
        Live traveler listings
      </h2>
      <div className="grid gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
