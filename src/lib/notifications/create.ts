import "server-only";

import {
  dbNotificationType,
  EMAIL_NOTIFICATION_EVENTS,
} from "@/lib/notifications/constants";
import { sendNotificationEmail } from "@/lib/notifications/email";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationEvent } from "@/types/notification";

export type CreateNotificationInput = {
  userId: string;
  event: NotificationEvent;
  title: string;
  body: string;
  linkUrl: string;
  metadata?: Record<string, unknown>;
  /** Skip when notifying self (actor performed the action). */
  actorId?: string;
  sendEmail?: boolean;
};

function shouldSendEmail(
  event: NotificationEvent,
  explicit?: boolean
): boolean {
  if (explicit === false) return false;
  if (explicit === true) return true;
  return EMAIL_NOTIFICATION_EVENTS.has(event);
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<string | null> {
  if (input.actorId && input.actorId === input.userId) {
    return null;
  }

  try {
    const admin = createAdminClient();
    const data = {
      event: input.event,
      link_url: input.linkUrl,
      ...input.metadata,
    };

    const { data: row, error } = await admin
      .from("notifications")
      .insert({
        user_id: input.userId,
        type: dbNotificationType(input.event),
        channel: "in_app",
        title: input.title,
        body: input.body,
        data,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[notifications] insert:", error.message);
      return null;
    }

    if (shouldSendEmail(input.event, input.sendEmail)) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email")
        .eq("id", input.userId)
        .maybeSingle();

      const email = profile?.email as string | undefined;
      if (email) {
        void sendNotificationEmail({
          to: email,
          event: input.event,
          title: input.title,
          body: input.body,
          linkUrl: input.linkUrl,
        });
      }
    }

    return row?.id as string;
  } catch (err) {
    console.error("[notifications] create failed:", err);
    return null;
  }
}
