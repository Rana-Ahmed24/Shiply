import "server-only";

import { mapNotificationRow } from "@/lib/notifications/mappers";
import { createClient } from "@/lib/supabase/server";
import type { AppNotification } from "@/types/notification";

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("[notifications] unread count:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getRecentNotifications(
  userId: string,
  limit = 12
): Promise<AppNotification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, user_id, type, channel, title, body, data, read_at, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("[notifications] recent:", error?.message);
    return [];
  }

  return data.map((row) =>
    mapNotificationRow(row as Parameters<typeof mapNotificationRow>[0])
  );
}

export async function getAllNotifications(
  userId: string,
  limit = 50
): Promise<AppNotification[]> {
  return getRecentNotifications(userId, limit);
}
