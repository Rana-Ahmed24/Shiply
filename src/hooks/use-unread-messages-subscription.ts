"use client";

import { useEffect } from "react";

import { dispatchMessagesUnreadChanged } from "@/lib/messages/unread-events";
import { createClientIfConfigured } from "@/lib/supabase/client";

/** Keeps navbar unread badge in sync when new messages or reads arrive. */
export function useUnreadMessagesSubscription(userId: string | null) {
  useEffect(() => {
    if (!userId) return;

    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const channel = supabase
      .channel(`unread-messages-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => dispatchMessagesUnreadChanged()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "message_reads" },
        () => dispatchMessagesUnreadChanged()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);
}
