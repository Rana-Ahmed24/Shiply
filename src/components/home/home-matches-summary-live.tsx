"use client";

import { useEffect, useState } from "react";

import { HomeMatchesSummary } from "@/components/home/home-matches-summary";
import { createClientIfConfigured } from "@/lib/supabase/client";
import type { AppMode } from "@/lib/mode/constants";

type HomeMatchesSummaryLiveProps = {
  mode: AppMode;
  initial: {
    sentCount: number;
    incomingCount: number;
    customerAcceptedCount: number;
    travelerAcceptedCount: number;
  };
  userId: string;
};

export function HomeMatchesSummaryLive({
  mode,
  initial,
  userId,
}: HomeMatchesSummaryLiveProps) {
  const [counts, setCounts] = useState(initial);

  useEffect(() => {
    async function refresh() {
      try {
        const res = await fetch("/api/matches/feed", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCounts({
            sentCount: data.sentCount,
            incomingCount: data.incomingCount,
            customerAcceptedCount: data.customerAcceptedCount,
            travelerAcceptedCount: data.travelerAcceptedCount,
          });
        }
      } catch {
        /* ignore */
      }
    }

    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const channel = supabase
      .channel(`home-match-counts-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "delivery_matches" },
        () => {
          void refresh();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <HomeMatchesSummary
      mode={mode}
      sentCount={counts.sentCount}
      incomingCount={counts.incomingCount}
      customerAcceptedCount={counts.customerAcceptedCount}
      travelerAcceptedCount={counts.travelerAcceptedCount}
    />
  );
}
