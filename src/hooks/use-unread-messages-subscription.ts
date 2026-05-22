"use client";

import { useEffect, useRef } from "react";

import { dispatchMessagesUnreadChanged } from "@/lib/messages/unread-events";
import { createClientIfConfigured } from "@/lib/supabase/client";

const REALTIME_DEBOUNCE_MS = 1_500;

/** Keeps navbar unread badge in sync when new messages or reads arrive. */
export function useUnreadMessagesSubscription(userId: string | null) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const notify = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatchMessagesUnreadChanged();
      }, REALTIME_DEBOUNCE_MS);
    };

    const channel = supabase
      .channel(`unread-messages-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        notify
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "message_reads" },
        notify
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      void supabase.removeChannel(channel);
    };
  }, [userId]);
}
