import { ListingCard } from "@/components/listings/listing-card";
import type { ListingCardModel } from "@/types/listing";
import { cn } from "@/lib/utils";

type ListingGridProps = {
  listings: ListingCardModel[];
  className?: string;
  emptyMessage?: string;
};

export function ListingGrid({
  listings,
  className,
  emptyMessage = "No listings match your filters. Try adjusting search or filters.",
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/60 py-16 text-center text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
