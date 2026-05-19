"use client";

import Link from "next/link";
import { Inbox, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";

import { HomeMatchRow } from "@/components/home/home-match-row";
import { buttonVariants } from "@/components/ui/button";
import { useQueryToast } from "@/hooks/use-query-toast";
import type { HomeMatchItem } from "@/types/home-match";
import { cn } from "@/lib/utils";

type MatchTab = "sent" | "incoming";

type MatchesPageTabsProps = {
  sent: HomeMatchItem[];
  incoming: HomeMatchItem[];
  sentCount: number;
  incomingCount: number;
};

function MatchesPageTabsInner({
  sent,
  incoming,
  sentCount,
  incomingCount,
}: MatchesPageTabsProps) {
  useQueryToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const activeTab: MatchTab =
    tabParam === "incoming" || tabParam === "sent" ? tabParam : "sent";

  const setTab = useCallback(
    (tab: MatchTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`/matches?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const items = activeTab === "sent" ? sent : incoming;

  return (
    <div className="space-y-6">
      <div
        className="inline-flex w-full max-w-md rounded-xl bg-muted/40 p-0.5"
        role="tablist"
        aria-label="Match lists"
      >
        <TabButton
          active={activeTab === "sent"}
          onClick={() => setTab("sent")}
          count={sentCount}
        >
          <Send className="mr-1.5 size-3.5" aria-hidden />
          Sent requests
        </TabButton>
        <TabButton
          active={activeTab === "incoming"}
          onClick={() => setTab("incoming")}
          count={incomingCount}
        >
          <Inbox className="mr-1.5 size-3.5" aria-hidden />
          Incoming requests
        </TabButton>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/40 shadow-soft">
        <div className="border-b border-border/50 px-4 py-4 sm:px-6">
          <h2 className="text-sm font-semibold">
            {activeTab === "sent" ? "Requests you sent" : "Requests sent to you"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeTab === "sent"
              ? "As a customer — track status and cancel pending requests."
              : "As a traveler — accept or decline delivery requests."}
          </p>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((match) => (
                <HomeMatchRow
                  key={match.id}
                  match={match}
                  variant={activeTab === "sent" ? "sent" : "incoming"}
                  returnTo="/matches"
                />
              ))}
            </ul>
          ) : activeTab === "sent" ? (
            <EmptySent />
          ) : (
            <EmptyIncoming />
          )}
        </div>
      </section>
    </div>
  );
}

export function MatchesPageTabs(props: MatchesPageTabsProps) {
  return (
    <Suspense fallback={<MatchesPageTabsFallback {...props} />}>
      <MatchesPageTabsInner {...props} />
    </Suspense>
  );
}

function MatchesPageTabsFallback({
  sent,
  incoming,
}: MatchesPageTabsProps) {
  const items = sent.length > 0 ? sent : incoming;
  return (
    <ul className="space-y-3">
      {items.map((match) => (
        <HomeMatchRow
          key={match.id}
          match={match}
          variant="sent"
          returnTo="/matches"
        />
      ))}
    </ul>
  );
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
        "flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {count > 0 && (
        <span
          className={cn(
            "ml-1 rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold",
            active ? "bg-brand-teal/15 text-brand-teal" : "bg-muted text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function EmptySent() {
  return (
    <div className="rounded-xl border border-dashed border-border/60 px-6 py-12 text-center">
      <p className="text-sm font-medium">No sent requests yet</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Find a traveler and send your first delivery request.
      </p>
      <Link
        href="/home"
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

function EmptyIncoming() {
  return (
    <div className="rounded-xl border border-dashed border-border/60 px-6 py-12 text-center">
      <p className="text-sm font-medium">No incoming requests yet</p>
      <p className="mt-2 text-sm text-muted-foreground">
        When customers send requests to your trips, they will appear here.
      </p>
      <Link
        href="/listings/new"
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
