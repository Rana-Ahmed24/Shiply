"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationReadAction(
  notificationId: string
): Promise<{ error?: string }> {
  const user = await requireUser();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notifications");
  return {};
}

export async function markAllNotificationsReadAction(): Promise<{
  error?: string;
}> {
  const user = await requireUser();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/notifications");
  return {};
}
