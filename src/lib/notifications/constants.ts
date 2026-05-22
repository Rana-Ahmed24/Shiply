import type { NotificationEvent } from "@/types/notification";

/** Maps to existing Postgres notification_type enum values. */
export function dbNotificationType(event: NotificationEvent): string {
  switch (event) {
    case "new_message":
      return "message";
    case "review_received":
      return "review";
    case "verification_approved":
    case "verification_rejected":
      return "verification";
    case "deposit_paid":
    case "purchase_confirmed":
      return "deposit";
    default:
      return "match_update";
  }
}

/** Events that also trigger optional transactional email. */
export const EMAIL_NOTIFICATION_EVENTS: ReadonlySet<NotificationEvent> =
  new Set([
    "match_accepted",
    "deposit_paid",
    "delivery_completed",
    "verification_approved",
    "verification_rejected",
  ]);
