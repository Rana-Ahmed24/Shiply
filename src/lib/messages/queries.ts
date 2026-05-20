import "server-only";

import { CHAT_ELIGIBLE_STATUSES } from "@/lib/messages/constants";
import { mapMessageRow, formatMessagePreview } from "@/lib/messages/mappers";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, ConversationPreview } from "@/types/chat";

type MessageRow = {
  id: string;
  match_id: string;
  body: string;
  sender_id: string;
  is_system: boolean;
  attachment_paths: string[];
  created_at: string;
};

export async function getMatchMessages(
  matchId: string,
  viewerId: string
): Promise<ChatMessage[]> {
  const supabase = await createClient();

  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      "id, match_id, body, sender_id, is_system, attachment_paths, created_at"
    )
    .eq("match_id", matchId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error || !messages?.length) {
    if (error) console.error("[messages] getMatchMessages:", error.message);
    return [];
  }

  const rows = messages as MessageRow[];
  const messageIds = rows.map((m) => m.id);

  const { data: reads } = await supabase
    .from("message_reads")
    .select("message_id, user_id")
    .in("message_id", messageIds);

  const readMap = new Map<string, Set<string>>();
  (reads ?? []).forEach((r) => {
    const set = readMap.get(r.message_id as string) ?? new Set();
    set.add(r.user_id as string);
    readMap.set(r.message_id as string, set);
  });

  const { data: match } = await supabase
    .from("delivery_matches")
    .select("traveler_id, customer_id")
    .eq("id", matchId)
    .maybeSingle();

  const otherId =
    match?.traveler_id === viewerId ? match?.customer_id : match?.traveler_id;

  return rows.map((row) => {
    const readers = readMap.get(row.id) ?? new Set();
    const readByOther =
      row.sender_id === viewerId && otherId ? readers.has(otherId) : false;
    return mapMessageRow(row, viewerId, readByOther);
  });
}

export async function markMatchMessagesRead(
  matchId: string,
  viewerId: string
): Promise<void> {
  const supabase = await createClient();

  const { data: unread } = await supabase
    .from("messages")
    .select("id, sender_id")
    .eq("match_id", matchId)
    .neq("sender_id", viewerId)
    .is("deleted_at", null);

  if (!unread?.length) return;

  const { data: existing } = await supabase
    .from("message_reads")
    .select("message_id")
    .eq("user_id", viewerId)
    .in(
      "message_id",
      unread.map((m) => m.id as string)
    );

  const existingSet = new Set((existing ?? []).map((r) => r.message_id as string));
  const toInsert = unread
    .filter((m) => !existingSet.has(m.id as string))
    .map((m) => ({
      message_id: m.id as string,
      user_id: viewerId,
    }));

  if (toInsert.length === 0) return;

  const { error } = await supabase.from("message_reads").upsert(toInsert, {
    onConflict: "message_id,user_id",
    ignoreDuplicates: true,
  });
  if (error) {
    console.error("[messages] markMatchMessagesRead:", error.message);
  }
}

/** Message IDs the viewer sent that the counterparty has read. */
export async function getReadReceiptsForMatch(
  matchId: string,
  viewerId: string
): Promise<string[]> {
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("delivery_matches")
    .select("traveler_id, customer_id")
    .eq("id", matchId)
    .maybeSingle();

  if (!match) return [];

  const otherId =
    match.traveler_id === viewerId ? match.customer_id : match.traveler_id;
  if (!otherId) return [];

  const { data: ownMessages } = await supabase
    .from("messages")
    .select("id")
    .eq("match_id", matchId)
    .eq("sender_id", viewerId)
    .is("deleted_at", null);

  const ownIds = (ownMessages ?? []).map((m) => m.id as string);
  if (ownIds.length === 0) return [];

  const { data: reads, error } = await supabase
    .from("message_reads")
    .select("message_id")
    .eq("user_id", otherId)
    .in("message_id", ownIds);

  if (error) {
    console.error("[messages] getReadReceiptsForMatch:", error.message);
    return [];
  }

  return (reads ?? []).map((r) => r.message_id as string);
}

export async function getTotalUnreadMessageCount(userId: string): Promise<number> {
  const conversations = await getConversationsForUser(userId);
  return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
}

export async function getConversationsForUser(
  userId: string
): Promise<ConversationPreview[]> {
  const supabase = await createClient();

  const { data: matches, error } = await supabase
    .from("delivery_matches")
    .select(
      "id, traveler_id, customer_id, request_id, listing_id, status, updated_at"
    )
    .or(`traveler_id.eq.${userId},customer_id.eq.${userId}`)
    .in("status", [...CHAT_ELIGIBLE_STATUSES])
    .order("updated_at", { ascending: false });

  if (error || !matches?.length) {
    if (error) console.error("[messages] getConversations:", error.message);
    return [];
  }

  const matchIds = matches.map((m) => m.id as string);
  const requestIds = [...new Set(matches.map((m) => m.request_id as string))];
  const listingIds = [...new Set(matches.map((m) => m.listing_id as string))];

  const profileIds = new Set<string>();
  matches.forEach((m) => {
    profileIds.add(
      m.traveler_id === userId ? (m.customer_id as string) : (m.traveler_id as string)
    );
  });

  const [requestsRes, listingsRes, profilesRes, messagesRes] = await Promise.all([
    supabase.from("customer_requests").select("id, title").in("id", requestIds),
    supabase
      .from("traveler_listings")
      .select("id, origin_city, destination_city")
      .in("id", listingIds),
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", [...profileIds]),
    supabase
      .from("messages")
      .select("id, match_id, body, sender_id, attachment_paths, created_at")
      .in("match_id", matchIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const requestMap = new Map(
    (requestsRes.data ?? []).map((r) => [r.id as string, r.title as string])
  );
  const listingMap = new Map(
    (listingsRes.data ?? []).map((l) => [
      l.id as string,
      `${l.origin_city} → ${l.destination_city}`,
    ])
  );
  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [
      p.id as string,
      {
        name: p.full_name as string | null,
        avatar: p.avatar_url as string | null,
      },
    ])
  );

  const lastByMatch = new Map<string, MessageRow>();
  (messagesRes.data ?? []).forEach((m) => {
    const mid = m.match_id as string;
    if (!lastByMatch.has(mid)) {
      lastByMatch.set(mid, m as MessageRow);
    }
  });

  const { data: allReads } = await supabase
    .from("message_reads")
    .select("message_id")
    .eq("user_id", userId);

  const readSet = new Set((allReads ?? []).map((r) => r.message_id as string));

  const unreadByMatch = new Map<string, number>();
  (messagesRes.data ?? []).forEach((m) => {
    if (m.sender_id === userId) return;
    if (readSet.has(m.id as string)) return;
    const mid = m.match_id as string;
    unreadByMatch.set(mid, (unreadByMatch.get(mid) ?? 0) + 1);
  });

  return matches.map((m) => {
    const counterpartyId =
      m.traveler_id === userId ? (m.customer_id as string) : (m.traveler_id as string);
    const profile = profileMap.get(counterpartyId);
    const last = lastByMatch.get(m.id as string);
    const title = requestMap.get(m.request_id as string) ?? "Delivery chat";

    return {
      matchId: m.id as string,
      href: `/messages/${m.id}`,
      title,
      subtitle: listingMap.get(m.listing_id as string) ?? "",
      counterpartyName: profile?.name ?? null,
      counterpartyAvatarUrl: profile?.avatar ?? null,
      lastMessagePreview: last
        ? formatMessagePreview(
            last.body,
            (last.attachment_paths as string[])?.length ?? 0
          )
        : null,
      lastMessageAt: last?.created_at ?? (m.updated_at as string),
      unreadCount: unreadByMatch.get(m.id as string) ?? 0,
    };
  });
}

export async function getConversationMeta(
  matchId: string,
  viewerId: string
): Promise<{
  title: string;
  counterpartyName: string | null;
  counterpartyAvatarUrl: string | null;
  counterpartyId: string;
} | null> {
  const supabase = await createClient();

  const { data: match, error } = await supabase
    .from("delivery_matches")
    .select("id, traveler_id, customer_id, request_id, status")
    .eq("id", matchId)
    .maybeSingle();

  if (error || !match) return null;
  if (match.traveler_id !== viewerId && match.customer_id !== viewerId) {
    return null;
  }
  if (!CHAT_ELIGIBLE_STATUSES.includes(match.status as (typeof CHAT_ELIGIBLE_STATUSES)[number])) {
    return null;
  }

  const counterpartyId =
    match.traveler_id === viewerId ? match.customer_id : match.traveler_id;

  const [requestRes, profileRes] = await Promise.all([
    supabase
      .from("customer_requests")
      .select("title")
      .eq("id", match.request_id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", counterpartyId)
      .maybeSingle(),
  ]);

  return {
    title: (requestRes.data?.title as string) ?? "Delivery chat",
    counterpartyName: (profileRes.data?.full_name as string | null) ?? null,
    counterpartyAvatarUrl: (profileRes.data?.avatar_url as string | null) ?? null,
    counterpartyId: counterpartyId as string,
  };
}
