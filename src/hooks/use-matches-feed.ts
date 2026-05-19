"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createClientIfConfigured } from "@/lib/supabase/client";
import type { MatchesFeed } from "@/types/home-match";

export function useMatchesFeed(initial: MatchesFeed, userId: string) {
  const [feed, setFeed] = useState<MatchesFeed>(initial);
  const fetching = useRef(false);

  const refresh = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    try {
      const res = await fetch("/api/matches/feed", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as MatchesFeed;
        setFeed(data);
      }
    } catch {
      /* ignore */
    } finally {
      fetching.current = false;
    }
  }, []);

  useEffect(() => {
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const channel = supabase
      .channel(`matches-feed-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "delivery_matches",
        },
        () => {
          void refresh();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  return { feed, refresh };
}
