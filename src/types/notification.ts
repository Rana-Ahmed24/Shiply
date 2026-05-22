/** Specific in-app notification events (stored in notifications.data.event). */
export type NotificationEvent =
  | "new_match"
  | "match_accepted"
  | "match_rejected"
  | "match_cancelled"
  | "deposit_paid"
  | "purchase_confirmed"
  | "delivery_completed"
  | "new_message"
  | "review_received"
  | "verification_approved"
  | "verification_rejected";

export type NotificationChannel = "in_app" | "email";

export type AppNotification = {
  id: string;
  userId: string;
  event: NotificationEvent;
  dbType: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  linkUrl: string;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};
