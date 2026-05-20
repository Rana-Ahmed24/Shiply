import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import type { ListingCardModel } from "@/types/listing";
import { cn } from "@/lib/utils";

type HeroListingPreviewCardProps = {
  listing: ListingCardModel;
  className?: string;
  style?: CSSProperties;
};

export function HeroListingPreviewCard({
  listing,
  className,
  style,
}: HeroListingPreviewCardProps) {
  return (
    <Link
      href={listing.href}
      className={cn(
        "block rounded-[14px] border border-brand-gold/20 bg-card p-4 shadow-soft transition-colors hover:border-brand-gold/35",
        className
      )}
      style={style}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-display text-sm font-semibold">
          {listing.origin.flag} {listing.origin.city}{" "}
          <ArrowRight
            className="mx-0.5 inline size-3 text-brand-gold"
            aria-hidden
          />
          {listing.destination.flag} {listing.destination.city}
        </p>
        {listing.rating > 0 && (
          <span className="shrink-0 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-2 py-0.5 text-[0.7rem] font-medium text-brand-gold-light">
            {listing.rating.toFixed(1)} ★
          </span>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">{listing.arrives}</p>
          <p className="text-[0.75rem] text-brand-muted">Arrives</p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{listing.capacity}</p>
          <p className="text-[0.75rem] text-brand-muted">Capacity</p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground line-clamp-1">
            {listing.service}
          </p>
          <p className="text-[0.75rem] text-brand-muted">Service</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {listing.verified && (
          <span className="shiply-tag shiply-tag-verified inline-flex items-center gap-0.5">
            <Check className="size-2.5" aria-hidden />
            Verified
          </span>
        )}
        {listing.categories.slice(0, 3).map((cat) => (
          <span key={cat} className="shiply-tag">
            {cat}
          </span>
        ))}
      </div>
    </Link>
  );
}
