"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  MESSAGES_READ_EVENT,
  TYPING_BROADCAST_EVENT,
  TYPING_TIMEOUT_MS,
} from "@/lib/messages/constants";
import { getChatImagePublicUrl } from "@/lib/messages/urls";
import { createClientIfConfigured } from "@/lib/supabase/client";
import type { ChatMessage } from "@/types/chat";

type RawMessage = {
  id: string;
  match_id: string;
  body: string;
  sender_id: string;
  is_system: boolean;
  attachment_paths: string[];
  created_at: string;
};

function mapIncoming(row: RawMessage, viewerId: string): ChatMessage {
  const paths = row.attachment_paths ?? [];

  return {
    id: row.id,
    matchId: row.match_id,
    body: row.body,
    senderId: row.sender_id,
    isSystem: row.is_system,
    attachmentUrls: paths.map((p) => getChatImagePublicUrl(p)),
    createdAt: row.created_at,
    isOwn: row.sender_id === viewerId,
    readByOther: false,
  };
}

type UseChatChannelOptions = {
  matchId: string;
  userId: string;
  otherUserId: string;
  initialMessages: ChatMessage[];
  onMarkRead: () => void | Promise<void>;
};

export function useChatChannel({
  matchId,
  userId,
  otherUserId,
  initialMessages,
  onMarkRead,
}: UseChatChannelOptions) {
  const [messages, setMessages] = useState(initialMessages);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const markOwnMessagesReadByOther = useCallback(() => {
    setMessages((prev) =>
      prev.map((m) => (m.isOwn ? { ...m, readByOther: true } : m))
    );
  }, []);

  const broadcastReadReceipts = useCallback(() => {
    const send = () => {
      void channelRef.current?.send({
        type: "broadcast",
        event: MESSAGES_READ_EVENT,
        payload: { userId },
      });
    };
    send();
    setTimeout(send, 400);
  }, [userId]);

  useEffect(() => {
    setMessages((prev) =>
      initialMessages.map((init) => {
        const existing = prev.find((m) => m.id === init.id);
        return existing
          ? { ...init, readByOther: existing.readByOther || init.readByOther }
          : init;
      })
    );
  }, [initialMessages]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await onMarkRead();
      if (!cancelled) broadcastReadReceipts();
    })();
    return () => {
      cancelled = true;
    };
  }, [matchId, onMarkRead, broadcastReadReceipts]);

  useEffect(() => {
    const supabase = createClientIfConfigured();
    if (!supabase) return;

    const channel = supabase
      .channel(`chat-room-${matchId}`, {
        config: { broadcast: { self: false } },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const row = payload.new as RawMessage;
          if (row.sender_id !== userId) {
            void onMarkRead();
            broadcastReadReceipts();
          }
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, mapIncoming(row, userId)];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message_reads",
        },
        (payload) => {
          const read = payload.new as { message_id: string; user_id: string };
          if (read.user_id !== otherUserId) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.isOwn && m.id === read.message_id
                ? { ...m, readByOther: true }
                : m
            )
          );
        }
      )
      .on("broadcast", { event: TYPING_BROADCAST_EVENT }, ({ payload }) => {
        const p = payload as { userId?: string };
        if (p.userId === otherUserId) {
          setOtherTyping(true);
          if (typingTimer.current) clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setOtherTyping(false), TYPING_TIMEOUT_MS);
        }
      })
      .on("broadcast", { event: MESSAGES_READ_EVENT }, ({ payload }) => {
        const p = payload as { userId?: string };
        if (p.userId === otherUserId) {
          markOwnMessagesReadByOther();
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channelRef.current = null;
      if (typingTimer.current) clearTimeout(typingTimer.current);
      void supabase.removeChannel(channel);
    };
  }, [
    matchId,
    userId,
    otherUserId,
    onMarkRead,
    broadcastReadReceipts,
    markOwnMessagesReadByOther,
  ]);

  const broadcastTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSent.current < 1500) return;
    lastTypingSent.current = now;

    void channelRef.current?.send({
      type: "broadcast",
      event: TYPING_BROADCAST_EVENT,
      payload: { userId },
    });
  }, [userId]);

  const appendOptimistic = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const patchMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }, []);

  return {
    messages,
    setMessages,
    otherTyping,
    broadcastTyping,
    appendOptimistic,
    patchMessage,
  };
}
