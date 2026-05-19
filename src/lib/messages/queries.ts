import "server-only";

import { createClient } from "@/lib/supabase/server";

export type MatchMessage = {
  id: string;
  body: string;
  senderId: string;
  isSystem: boolean;
  createdAt: string;
};

export async function getMatchMessages(matchId: string): Promise<MatchMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, body, sender_id, is_system, created_at")
    .eq("match_id", matchId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[messages] getMatchMessages:", error.message);
    return [];
  }

  return (data ?? []).map((m) => ({
    id: m.id as string,
    body: m.body as string,
    senderId: m.sender_id as string,
    isSystem: Boolean(m.is_system),
    createdAt: m.created_at as string,
  }));
}
