import { getChatImagePublicUrl } from "@/lib/messages/urls";
import type { ChatMessage } from "@/types/chat";

type MessageRow = {
  id: string;
  match_id: string;
  body: string;
  sender_id: string;
  is_system: boolean;
  attachment_paths: string[];
  created_at: string;
};

export function mapMessageRow(
  row: MessageRow,
  viewerId: string,
  readByOther: boolean
): ChatMessage {
  return {
    id: row.id,
    matchId: row.match_id,
    body: row.body,
    senderId: row.sender_id,
    isSystem: row.is_system,
    attachmentUrls: (row.attachment_paths ?? []).map((p) =>
      p.startsWith("http") ? p : getChatImagePublicUrl(p)
    ),
    createdAt: row.created_at,
    isOwn: row.sender_id === viewerId,
    readByOther,
  };
}

export function formatMessagePreview(
  body: string,
  attachmentCount: number
): string {
  if (body.trim()) return body.trim().slice(0, 80);
  if (attachmentCount > 0) return "📷 Photo";
  return "Message";
}

export function formatConversationTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-GB", { weekday: "short" });
  }
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
