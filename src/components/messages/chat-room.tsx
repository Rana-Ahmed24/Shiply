"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCallback, useLayoutEffect, useRef } from "react";

import { ChatComposer } from "@/components/messages/chat-composer";
import { MessageBubble } from "@/components/messages/message-bubble";
import { TypingIndicator } from "@/components/messages/typing-indicator";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { useChatChannel } from "@/hooks/use-chat-channel";
import { markChatReadAction } from "@/lib/messages/actions";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

type ChatRoomMeta = {
  title: string;
  counterpartyName: string | null;
  counterpartyAvatarUrl: string | null;
};

type ChatRoomProps = {
  matchId: string;
  userId: string;
  otherUserId: string;
  meta: ChatRoomMeta;
  initialMessages: ChatMessage[];
  backHref?: string;
  className?: string;
};

function scrollMessagesToBottom(container: HTMLDivElement, smooth: boolean) {
  if (smooth) {
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  } else {
    container.scrollTop = container.scrollHeight;
  }
}

export function ChatRoom({
  matchId,
  userId,
  otherUserId,
  meta,
  initialMessages,
  backHref = "/messages",
  className,
}: ChatRoomProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(initialMessages.length);
  const initialScrollDone = useRef(false);

  const onMarkRead = useCallback(() => {
    void markChatReadAction(matchId);
  }, [matchId]);

  const { messages, otherTyping, broadcastTyping } = useChatChannel({
    matchId,
    userId,
    otherUserId,
    initialMessages,
    onMarkRead,
  });

  useLayoutEffect(() => {
    const el = messagesRef.current;
    if (!el) return;

    if (!initialScrollDone.current) {
      scrollMessagesToBottom(el, false);
      initialScrollDone.current = true;
      prevCountRef.current = messages.length;
      return;
    }

    if (messages.length > prevCountRef.current || otherTyping) {
      scrollMessagesToBottom(el, true);
    }
    prevCountRef.current = messages.length;
  }, [messages, otherTyping]);

  return (
    <div
      className={cn(
        "flex h-[min(70dvh,32rem)] max-h-[min(70dvh,32rem)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft md:h-[calc(100dvh-12rem)] md:max-h-[calc(100dvh-12rem)] md:min-h-[28rem]",
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-border/50 px-3 py-3">
        <Link
          href={backHref}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Back to messages"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <ProfileAvatar
          name={meta.counterpartyName}
          avatarUrl={meta.counterpartyAvatarUrl}
          size="sm"
          className="!size-10 !text-xs rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">
            {meta.counterpartyName ?? "Chat"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{meta.title}</p>
        </div>
      </header>

      <div
        ref={messagesRef}
        className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-4"
      >
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No messages yet. Say hello to coordinate delivery details.
          </p>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        {otherTyping ? (
          <TypingIndicator name={meta.counterpartyName} />
        ) : null}
      </div>

      <ChatComposer
        matchId={matchId}
        onTyping={broadcastTyping}
        onSent={() => {
          const el = messagesRef.current;
          if (el) scrollMessagesToBottom(el, true);
        }}
      />
    </div>
  );
}
