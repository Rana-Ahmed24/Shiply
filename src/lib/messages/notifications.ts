import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function notifyNewMessage(params: {
  recipientId: string;
  senderName: string;
  matchId: string;
  preview: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      user_id: params.recipientId,
      type: "message",
      channel: "in_app",
      title: `Message from ${params.senderName}`,
      body: params.preview.slice(0, 120),
      data: { match_id: params.matchId },
    });
  } catch (err) {
    console.error("[messages] notifyNewMessage:", err);
  }
}
