import { HeroListingPreviewCard } from "@/components/home/hero-listing-preview-card";
import type { ListingCardModel } from "@/types/listing";

type HeroListingsPanelProps = {
  listings: ListingCardModel[];
};

export function HeroListingsPanel({ listings }: HeroListingsPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-xs tracking-wide text-brand-teal-light">
        <span className="size-1.5 animate-pulse rounded-full bg-brand-teal-light" />
        Live traveler listings
      </p>
      {listings.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-border/80 bg-card p-6 text-center text-sm text-brand-muted">
          No active trips yet. List your journey to get started.
        </p>
      ) : (
        listings.map((listing, index) => (
          <HeroListingPreviewCard
            key={listing.id}
            listing={listing}
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))
      )}
    </div>
  );
}
