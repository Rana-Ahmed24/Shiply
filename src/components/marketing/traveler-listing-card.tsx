import { ListingTripDates } from "@/components/listings/listing-trip-dates";
import { Badge } from "@/components/ui/badge";
import type { TravelerListing } from "@/types/listing";
import { cn } from "@/lib/utils";
import { fontSyne } from "@/lib/fonts";

type TravelerListingCardProps = {
  listing: TravelerListing;
  className?: string;
};

export function TravelerListingCard({
  listing,
  className,
}: TravelerListingCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-shadow hover:shadow-soft-lg",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">
          <span className="mr-1">{listing.origin.flag}</span>
          <span className={fontSyne.className}>{listing.origin.city}</span>
          <span className="mx-2 text-muted-foreground">→</span>
          <span className="mr-1">{listing.destination.flag}</span>
          <span className={fontSyne.className}>{listing.destination.city}</span>
        </p>
        <Badge className="shrink-0 rounded-full border-0 bg-brand-gold/15 px-2.5 text-brand-gold">
          {listing.rating} ★
        </Badge>
      </div>

      <ListingTripDates departs={null} arrives={listing.arrives} className="mt-4" />

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            Capacity
          </p>
          <p className="mt-1 text-sm font-medium">{listing.capacity}</p>
        </div>
        <div>
          <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            Service
          </p>
          <p className="mt-1 text-sm font-medium">{listing.service}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {listing.verified && (
          <Badge
            variant="outline"
            className="rounded-full border-brand-teal/30 bg-brand-teal/10 text-brand-teal"
          >
            Verified
          </Badge>
        )}
        {listing.categories.map((category) => (
          <Badge
            key={category}
            variant="secondary"
            className="rounded-full bg-muted/80 text-muted-foreground"
          >
            {category}
          </Badge>
        ))}
      </div>
    </article>
  );
}
