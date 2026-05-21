"use client";

import Link from "next/link";
import { CheckCircle2, Inbox, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";

import { AcceptedMatchRow } from "@/components/matching/accepted-match-row";
import { HomeMatchRow } from "@/components/home/home-match-row";
import { buttonVariants } from "@/components/ui/button";
import { useMatchesFeed } from "@/hooks/use-matches-feed";
import { useQueryToast } from "@/hooks/use-query-toast";
import type { MatchesFeed } from "@/types/home-match";
import { cn } from "@/lib/utils";

type MatchTab = "sent" | "incoming" | "accepted";

type MatchesPageLiveProps = {
  initialFeed: MatchesFeed;
  userId: string;
};

function MatchesPageLiveInner({ initialFeed, userId }: MatchesPageLiveProps) {
  useQueryToast();
  const { feed } = useMatchesFeed(initialFeed, userId);
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const activeTab: MatchTab =
    tabParam === "incoming" || tabParam === "accepted" || tabParam === "sent"
      ? tabParam
      : "sent";

  const setTab = useCallback(
    (tab: MatchTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`/matches?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const items =
    activeTab === "sent"
      ? feed.sent
      : activeTab === "incoming"
        ? feed.incoming
        : feed.accepted;

  return (
    <div className="space-y-6">
      <div
        className="flex w-full max-w-2xl flex-wrap gap-1 rounded-xl bg-muted p-0.5"
        role="tablist"
        aria-label="Match lists"
      >
        <TabButton
          active={activeTab === "sent"}
          onClick={() => setTab("sent")}
          count={feed.sentCount}
        >
          <Send className="mr-1.5 size-3.5 shrink-0" aria-hidden />
          Sent requests
        </TabButton>
        <TabButton
          active={activeTab === "incoming"}
          onClick={() => setTab("incoming")}
          count={feed.incomingCount}
        >
          <Inbox className="mr-1.5 size-3.5 shrink-0" aria-hidden />
          Incoming
        </TabButton>
        <TabButton
          active={activeTab === "accepted"}
          onClick={() => setTab("accepted")}
          count={feed.acceptedCount}
        >
          <CheckCircle2 className="mr-1.5 size-3.5 shrink-0" aria-hidden />
          Accepted
        </TabButton>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card shadow-soft">
        <div className="border-b border-border/50 px-4 py-4 sm:px-6">
          <h2 className="text-sm font-semibold">{tabTitle(activeTab)}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {tabDescription(activeTab)}
          </p>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {items.length > 0 ? (
            <ul className="space-y-3">
              {activeTab === "accepted"
                ? feed.accepted.map((match) => (
                    <AcceptedMatchRow key={match.id} match={match} />
                  ))
                : items.map((match) => (
                    <HomeMatchRow
                      key={match.id}
                      match={match}
                      variant={activeTab === "sent" ? "sent" : "incoming"}
                      returnTo="/matches"
                    />
                  ))}
            </ul>
          ) : (
            <EmptyState tab={activeTab} />
          )}
        </div>
      </section>
    </div>
  );
}

export function MatchesPageLive(props: MatchesPageLiveProps) {
  return (
    <Suspense fallback={null}>
      <MatchesPageLiveInner {...props} />
    </Suspense>
  );
}

function tabTitle(tab: MatchTab): string {
  switch (tab) {
    case "sent":
      return "Requests you sent";
    case "incoming":
      return "Incoming requests";
    case "accepted":
      return "Accepted matches";
  }
}

function tabDescription(tab: MatchTab): string {
  switch (tab) {
    case "sent":
      return "Pending delivery requests waiting for a traveler response.";
    case "incoming":
      return "Customers requesting your trip — accept or decline.";
    case "accepted":
      return "Active deals you can chat about and coordinate delivery.";
  }
}

function TabButton({
  children,
  active,
  onClick,
  count,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {count > 0 && (
        <span
          className={cn(
            "ml-0.5 rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold",
            active ? "bg-brand-teal/15 text-brand-teal" : "bg-muted text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyState({ tab }: { tab: MatchTab }) {
  if (tab === "accepted") {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No accepted matches yet. When a request is accepted, it appears here.
      </p>
    );
  }
  if (tab === "incoming") {
    return (
      <div className="rounded-xl border border-dashed border-border/60 px-6 py-12 text-center">
        <p className="text-sm font-medium">No incoming requests yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          When customers send requests to your trips, they will appear here.
        </p>
        <Link
          href="/listings/new?promptVerify=1"
          className={cn(
            buttonVariants({ size: "sm" }),
            "mt-5 inline-flex rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
          )}
        >
          List a trip
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-dashed border-border/60 px-6 py-12 text-center">
      <p className="text-sm font-medium">No sent requests yet</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Find a traveler and send your first delivery request.
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants({ size: "sm" }),
          "mt-5 inline-flex rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
        )}
      >
        Browse travelers
      </Link>
    </div>
  );
}
