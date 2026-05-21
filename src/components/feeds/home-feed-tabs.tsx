"use client";

import Link from "next/link";
import { Inbox, Plane } from "lucide-react";
import { useEffect, useState } from "react";

import { ListingBrowseCard } from "@/components/listings/listing-browse-card";
import { RequestBrowseCard } from "@/components/requests/request-browse-card";
import { buttonVariants } from "@/components/ui/button";
import { defaultFeedTab, type AppMode } from "@/lib/mode/constants";
import { useAppMode } from "@/lib/mode/client-store";
import type { ListingCardModel } from "@/types/listing";
import type { RequestCardModel } from "@/types/request";
import { cn } from "@/lib/utils";

type FeedTab = "travelers" | "requests";

const FEED_META: Record<
  FeedTab,
  { title: string; emptyTitle: string; emptyHint: string; ctaHref: string; ctaLabel: string }
> = {
  travelers: {
    title: "Available Travelers",
    emptyTitle: "No traveler listings available yet",
    emptyHint: "List your upcoming trip or check again later.",
    ctaHref: "/listings/new?promptVerify=1",
    ctaLabel: "List a trip",
  },
  requests: {
    title: "Delivery Requests",
    emptyTitle: "No delivery requests available yet",
    emptyHint: "Create a request or check again later.",
    ctaHref: "/requests/new",
    ctaLabel: "Create a request",
  },
};

type HomeFeedTabsProps = {
  mode: AppMode;
  travelers: ListingCardModel[];
  requests: RequestCardModel[];
};

export function HomeFeedTabs({ mode: serverMode, travelers, requests }: HomeFeedTabsProps) {
  const mode = useAppMode(serverMode);
  const [manualTab, setManualTab] = useState<FeedTab | null>(null);

  useEffect(() => {
    setManualTab(null);
  }, [mode]);

  const activeTab = manualTab ?? defaultFeedTab(mode);
  const meta = FEED_META[activeTab];
  const count = activeTab === "travelers" ? travelers.length : requests.length;

  return (
    <section
      className="rounded-2xl border border-border/60 bg-card shadow-soft"
      aria-labelledby="home-feed-heading"
    >
      <div className="flex flex-col gap-4 border-b border-border/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div
          className="inline-flex w-full max-w-xs rounded-xl bg-muted p-0.5 sm:w-auto"
          role="tablist"
          aria-label="Home feeds"
        >
          <TabButton
            active={activeTab === "travelers"}
            onClick={() => setManualTab("travelers")}
          >
            Travelers
          </TabButton>
          <TabButton
            active={activeTab === "requests"}
            onClick={() => setManualTab("requests")}
          >
            Requests
          </TabButton>
        </div>

        <p className="text-xs text-muted-foreground sm:text-right">
          {count} {count === 1 ? "result" : "results"}
        </p>
      </div>

      <div className="space-y-4 px-4 py-5 sm:px-6 sm:py-6">
        <h2
          id="home-feed-heading"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          {meta.title}
        </h2>

        {count > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeTab === "travelers"
              ? travelers.map((listing) => (
                  <ListingBrowseCard key={listing.id} listing={listing} />
                ))
              : requests.map((request) => (
                  <RequestBrowseCard key={request.id} request={request} />
                ))}
          </div>
        ) : (
          <EmptyFeed
            icon={activeTab === "travelers" ? Plane : Inbox}
            title={meta.emptyTitle}
            hint={meta.emptyHint}
            ctaHref={meta.ctaHref}
            ctaLabel={meta.ctaLabel}
          />
        )}
      </div>
    </section>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function EmptyFeed({
  icon: Icon,
  title,
  hint,
  ctaHref,
  ctaLabel,
}: {
  icon: typeof Plane;
  title: string;
  hint: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border/60 bg-muted px-6 py-12 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-border/50 bg-card-hover">
        <Icon className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>
      <Link
        href={ctaHref}
        className={cn(
          buttonVariants({ size: "sm" }),
          "mt-5 rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
        )}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
