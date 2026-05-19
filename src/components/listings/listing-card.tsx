import Link from "next/link";

import { ListingTripDates } from "@/components/listings/listing-trip-dates";
import { Badge } from "@/components/ui/badge";
import { fontSyne } from "@/lib/fonts";
import type { ListingCardModel } from "@/types/listing";
import { cn } from "@/lib/utils";

type ListingCardProps = {
  listing: ListingCardModel;
  className?: string;
};

export function ListingCard({ listing, className }: ListingCardProps) {
  return (
    <Link
      href={listing.href}
      className={cn(
        "group block rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-shadow hover:border-brand-gold/30 hover:shadow-soft-lg",
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
        {listing.rating > 0 && (
          <Badge className="shrink-0 rounded-full border-0 bg-brand-gold/15 px-2.5 text-brand-gold">
            {listing.rating.toFixed(1)} ★
          </Badge>
        )}
      </div>

      {listing.travelerName && (
        <p className="mt-2 text-xs text-muted-foreground">
          Traveler · {listing.travelerName}
        </p>
      )}

      <ListingTripDates
        departs={listing.departs}
        arrives={listing.arrives}
        className="mt-4"
      />

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
          <p className="mt-1 text-sm font-medium line-clamp-2">
            {listing.service}
          </p>
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
        {listing.categories.slice(0, 3).map((category) => (
          <Badge
            key={category}
            variant="secondary"
            className="rounded-full bg-muted/80 text-muted-foreground"
          >
            {category}
          </Badge>
        ))}
        {listing.categories.length > 3 && (
          <Badge variant="secondary" className="rounded-full">
            +{listing.categories.length - 3}
          </Badge>
        )}
      </div>
    </Link>
  );
}
