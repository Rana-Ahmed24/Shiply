import "server-only";

import { createClient } from "@/lib/supabase/server";

/** Seed a system welcome message when a match is accepted (idempotent). */
export async function seedMatchChatWelcome(
  matchId: string,
  senderId: string
): Promise<void> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("messages")
    .select("id")
    .eq("match_id", matchId)
    .eq("is_system", true)
    .limit(1);

  if (existing?.length) return;

  const { error } = await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: senderId,
    body: "Delivery match accepted. Coordinate pickup and delivery details here.",
    is_system: true,
  });

  if (error) {
    console.error("[matching] seedMatchChatWelcome:", error.message);
  }
}
