import Link from "next/link";
import { Plane, ShieldCheck, Star } from "lucide-react";

import { TravelerVerificationBadge } from "@/components/verification/traveler-verification-badge";
import { buttonVariants } from "@/components/ui/button";
import { OwnershipDisabledCta } from "@/components/ui/ownership-disabled-cta";
import type { ListingCardModel } from "@/types/listing";
import { cn } from "@/lib/utils";

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarTone(id: string): string {
  const tones = [
    "bg-brand-gold/20 text-brand-gold-light",
    "bg-brand-teal/20 text-brand-teal-light",
    "bg-brand-muted/20 text-brand-muted",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
  return tones[hash % tones.length] ?? tones[0]!;
}

type TravelerFeedCardProps = {
  listing: ListingCardModel;
  currentUserId?: string | null;
  className?: string;
};

export function TravelerFeedCard({
  listing,
  currentUserId,
  className,
}: TravelerFeedCardProps) {
  const isOwner = Boolean(
    currentUserId && listing.travelerId === currentUserId
  );

  const dealsLabel =
    listing.reviewCount > 0
      ? `${listing.reviewCount} review${listing.reviewCount === 1 ? "" : "s"}`
      : "New traveler";

  return (
    <article className={cn("feed-card flex flex-col", className)}>
      <Link href={listing.href} className="flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold",
                avatarTone(listing.travelerId)
              )}
            >
              {initials(listing.travelerName)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {listing.travelerName ?? "Traveler"}
              </p>
              <p className="text-[0.72rem] text-brand-muted">{dealsLabel}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2.5 py-0.5 text-[0.68rem] text-brand-gold-light">
            Arrives {listing.arrives}
          </span>
        </div>

        <div className="mb-3 flex items-center gap-3 rounded-[10px] bg-muted px-3 py-3">
          <div className="min-w-0 flex-1 text-center">
            <p className="font-display text-sm font-semibold">
              {listing.origin.flag} {listing.origin.city}
            </p>
            <p className="mt-0.5 text-[0.65rem] text-brand-muted">
              {listing.origin.country}
            </p>
          </div>
          <div className="flex flex-1 items-center gap-1">
            <span className="h-px flex-1 bg-brand-gold/30" />
            <Plane className="size-3.5 shrink-0 text-brand-gold" aria-hidden />
            <span className="h-px flex-1 bg-brand-gold/30" />
          </div>
          <div className="min-w-0 flex-1 text-center">
            <p className="font-display text-sm font-semibold">
              {listing.destination.flag} {listing.destination.city}
            </p>
            <p className="mt-0.5 text-[0.65rem] text-brand-muted">
              {listing.destination.country}
            </p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <div>
            <p className="text-[0.68rem] text-brand-muted">Arrival</p>
            <p className="text-sm font-medium">{listing.arrives}</p>
          </div>
          <div>
            <p className="text-[0.68rem] text-brand-muted">Capacity</p>
            <p className="text-sm font-medium">{listing.capacity}</p>
          </div>
          <div>
            <p className="text-[0.68rem] text-brand-muted">Service</p>
            <p className="text-sm font-medium line-clamp-2">{listing.service}</p>
          </div>
        </div>

        <p className="mb-2 text-[0.68rem] text-brand-muted">Accepts</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {listing.verified ? (
            <TravelerVerificationBadge status="verified" className="shiply-tag" />
          ) : null}
          {listing.categories.slice(0, 4).map((cat) => (
            <span key={cat} className="shiply-tag">
              {cat}
            </span>
          ))}
        </div>

        {(listing.rating > 0 || listing.verified) && (
          <div className="mb-1">
            {listing.rating > 0 && (
              <p className="flex items-center gap-1 text-sm font-medium text-brand-gold-light">
                <Star
                  className="size-3.5 fill-brand-gold text-brand-gold"
                  aria-hidden
                />
                {listing.rating.toFixed(1)} · {listing.reviewCount}
              </p>
            )}
            {listing.verified && (
              <p className="mt-1 flex items-center gap-1 text-[0.68rem] text-brand-teal-light">
                <ShieldCheck className="size-3" aria-hidden />
                Flight & ID verified
              </p>
            )}
          </div>
        )}
      </Link>

      <div className="flex justify-end border-t border-border/60 pt-3.5">
        {isOwner ? (
          <OwnershipDisabledCta
            label="Your offer"
            tooltip="You cannot contact yourself on your own trip"
            block={false}
          />
        ) : (
          <Link
            href={listing.href}
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-lg bg-brand-gold px-4 text-xs font-medium text-brand-navy hover:bg-brand-gold-light"
            )}
          >
            Contact
          </Link>
        )}
      </div>
    </article>
  );
}
