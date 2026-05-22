"use client";

import { useEffect } from "react";

import {
  payloadFromRealtimeRow,
  type NotificationRealtimePayload,
} from "@/lib/notifications/realtime-payload";
import { dispatchNotificationsChanged } from "@/lib/notifications/unread-events";
import { createClientIfConfigured } from "@/lib/supabase/client";

type UseNotificationsRealtimeOptions = {
  userId: string | null;
  onInsert?: (notification: NotificationRealtimePayload) => void;
};

export function useNotificationsRealtime({
  userId,
  onInsert,
}: UseNotificationsRealtimeOptions) {
  useEffect(() => {
    if (!userId || !onInsert) return;

    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            user_id: string;
            type: string;
            title: string;
            body: string;
            data: Record<string, unknown> | null;
            read_at: string | null;
            created_at: string;
          };
          onInsert(payloadFromRealtimeRow(row));
          dispatchNotificationsChanged();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, onInsert]);
}
