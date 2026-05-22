import type { AppNotification, NotificationEvent } from "@/types/notification";

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  channel: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

const EVENTS = new Set<string>([
  "new_match",
  "match_accepted",
  "match_rejected",
  "match_cancelled",
  "deposit_paid",
  "purchase_confirmed",
  "delivery_completed",
  "new_message",
  "review_received",
  "verification_approved",
  "verification_rejected",
]);

function parseEvent(data: Record<string, unknown> | null, dbType: string): NotificationEvent {
  const raw = data?.event;
  if (typeof raw === "string" && EVENTS.has(raw)) {
    return raw as NotificationEvent;
  }
  if (dbType === "message") return "new_message";
  if (dbType === "review") return "review_received";
  if (dbType === "verification") return "verification_approved";
  if (dbType === "deposit") return "deposit_paid";
  return "new_match";
}

function parseLinkUrl(data: Record<string, unknown> | null): string {
  const link = data?.link_url;
  if (typeof link === "string" && link.startsWith("/")) return link;
  const matchId = data?.match_id;
  if (typeof matchId === "string") {
    if (data?.event === "new_message") return `/messages/${matchId}`;
    return `/matches/${matchId}`;
  }
  return "/notifications";
}

export function mapNotificationRow(row: NotificationRow): AppNotification {
  const data = (row.data ?? {}) as Record<string, unknown>;
  const { event: _e, link_url: _l, ...rest } = data;

  return {
    id: row.id,
    userId: row.user_id,
    event: parseEvent(data, row.type),
    dbType: row.type,
    channel: row.channel as AppNotification["channel"],
    title: row.title,
    body: row.body,
    linkUrl: parseLinkUrl(data),
    metadata: rest,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}
