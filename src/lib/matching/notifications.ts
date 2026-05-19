import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function notifyMatchUpdate(params: {
  userId: string;
  title: string;
  body: string;
  matchId: string;
  extra?: Record<string, unknown>;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("notifications").insert({
      user_id: params.userId,
      type: "match_update",
      channel: "in_app",
      title: params.title,
      body: params.body,
      data: {
        match_id: params.matchId,
        ...params.extra,
      },
    });

    if (error) {
      console.error("[matching] notifyMatchUpdate:", error.message);
    }
  } catch (err) {
    console.error("[matching] notifyMatchUpdate failed:", err);
  }
}
