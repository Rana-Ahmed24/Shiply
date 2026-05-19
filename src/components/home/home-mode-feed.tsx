"use client";

import Link from "next/link";
import { Inbox, Plane } from "lucide-react";

import { ListingBrowseCard } from "@/components/listings/listing-browse-card";
import { RequestBrowseCard } from "@/components/requests/request-browse-card";
import { buttonVariants } from "@/components/ui/button";
import { useAppMode } from "@/lib/mode/client-store";
import type { AppMode } from "@/lib/mode/constants";
import type { ListingCardModel } from "@/types/listing";
import type { RequestCardModel } from "@/types/request";
import { cn } from "@/lib/utils";

type HomeModeFeedProps = {
  mode: AppMode;
  travelers: ListingCardModel[];
  requests: RequestCardModel[];
};

const FEED_META = {
  customer: {
    title: "Available Travelers",
    emptyTitle: "No traveler listings available yet",
    emptyHint: "List your upcoming trip or check again later.",
    ctaHref: "/listings/new",
    ctaLabel: "List a trip",
    icon: Plane,
  },
  traveler: {
    title: "Delivery Requests",
    emptyTitle: "No delivery requests available yet",
    emptyHint: "Create a request or check again later.",
    ctaHref: "/requests/new",
    ctaLabel: "Create a request",
    icon: Inbox,
  },
} as const;

export function HomeModeFeed({
  mode: serverMode,
  travelers,
  requests,
}: HomeModeFeedProps) {
  const mode = useAppMode(serverMode);
  const meta = FEED_META[mode];
  const items = mode === "customer" ? travelers : requests;
  const count = items.length;
  const Icon = meta.icon;

  return (
    <section
      className="rounded-2xl border border-border/60 bg-card/40 shadow-soft"
      aria-labelledby="home-feed-heading"
    >
      <div className="border-b border-border/50 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="home-feed-heading"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            {meta.title}
          </h2>
          <p className="text-xs text-muted-foreground">
            {count} {count === 1 ? "result" : "results"}
          </p>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        {count > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mode === "customer"
              ? travelers.map((listing) => (
                  <ListingBrowseCard key={listing.id} listing={listing} />
                ))
              : requests.map((request) => (
                  <RequestBrowseCard key={request.id} request={request} />
                ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border/60 bg-muted/15 px-6 py-12 text-center">
            <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-border/50 bg-card/80">
              <Icon className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">{meta.emptyTitle}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {meta.emptyHint}
            </p>
            <Link
              href={meta.ctaHref}
              className={cn(
                buttonVariants({ size: "sm" }),
                "mt-5 rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
              )}
            >
              {meta.ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
