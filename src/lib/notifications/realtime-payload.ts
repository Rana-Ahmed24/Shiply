import type { AppNotification, NotificationEvent } from "@/types/notification";

/** Shape broadcast from Supabase Realtime INSERT payload (client-safe). */
export type NotificationRealtimePayload = {
  id: string;
  userId: string;
  event: NotificationEvent;
  title: string;
  body: string;
  linkUrl: string;
  createdAt: string;
  readAt: string | null;
};

export function payloadFromAppNotification(
  n: AppNotification
): NotificationRealtimePayload {
  return {
    id: n.id,
    userId: n.userId,
    event: n.event,
    title: n.title,
    body: n.body,
    linkUrl: n.linkUrl,
    createdAt: n.createdAt,
    readAt: n.readAt,
  };
}

export function payloadFromRealtimeRow(row: {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}): NotificationRealtimePayload {
  const data = row.data ?? {};
  const event =
    typeof data.event === "string"
      ? (data.event as NotificationEvent)
      : row.type === "message"
        ? "new_message"
        : "new_match";
  const linkUrl =
    typeof data.link_url === "string"
      ? data.link_url
      : typeof data.match_id === "string"
        ? event === "new_message"
          ? `/messages/${data.match_id}`
          : `/matches/${data.match_id}`
        : "/notifications";

  return {
    id: row.id,
    userId: row.user_id,
    event,
    title: row.title,
    body: row.body,
    linkUrl,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}
