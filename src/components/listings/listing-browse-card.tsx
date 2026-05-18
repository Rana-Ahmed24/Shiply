import Link from "next/link";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { fontSyne } from "@/lib/fonts";
import type { ListingCardModel } from "@/types/listing";
import { cn } from "@/lib/utils";

type ListingBrowseCardProps = {
  listing: ListingCardModel;
  className?: string;
};

export function ListingBrowseCard({ listing, className }: ListingBrowseCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-soft",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <ProfileAvatar
          name={listing.travelerName}
          avatarUrl={listing.travelerAvatarUrl}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{listing.travelerName ?? "Traveler"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className={fontSyne.className}>
              {listing.origin.flag} {listing.origin.city}
            </span>
            <span className="mx-1.5">→</span>
            <span className={fontSyne.className}>
              {listing.destination.flag} {listing.destination.city}
            </span>
          </p>
          {listing.rating > 0 && (
            <p className="mt-1 text-xs text-brand-gold">
              {listing.rating.toFixed(1)} ★ rating
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="text-[0.65rem] uppercase text-muted-foreground">Travel</p>
          <p className="mt-0.5 font-medium">{listing.arrives}</p>
        </div>
        <div>
          <p className="text-[0.65rem] uppercase text-muted-foreground">Space</p>
          <p className="mt-0.5 font-medium">{listing.capacity}</p>
        </div>
        <div>
          <p className="text-[0.65rem] uppercase text-muted-foreground">Trips</p>
          <p className="mt-0.5 font-medium">{listing.reviewCount} reviews</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {listing.categories.slice(0, 2).map((cat) => (
          <Badge key={cat} variant="secondary" className="rounded-full">
            {cat}
          </Badge>
        ))}
      </div>

      <Link
        href={listing.href}
        className={cn(
          buttonVariants({ size: "sm" }),
          "mt-4 w-full rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
        )}
      >
        Send delivery request
      </Link>
    </article>
  );
}
