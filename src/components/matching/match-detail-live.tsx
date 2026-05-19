"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createClientIfConfigured } from "@/lib/supabase/client";

/** Refreshes match detail when delivery_matches row updates (e.g. accepted). */
export function MatchDetailLive({
  matchId,
  userId,
}: {
  matchId: string;
  userId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const channel = supabase
      .channel(`match-detail-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "delivery_matches",
          filter: `id=eq.${matchId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [matchId, userId, router]);

  return null;
}
