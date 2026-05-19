"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

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

export function ChatRoom({
  matchId,
  userId,
  otherUserId,
  meta,
  initialMessages,
  backHref = "/messages",
  className,
}: ChatRoomProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft md:min-h-[32rem]",
        className
      )}
    >
      <header className="flex items-center gap-3 border-b border-border/50 px-3 py-3">
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

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
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
        <div ref={bottomRef} />
      </div>

      <ChatComposer
        matchId={matchId}
        onTyping={broadcastTyping}
        onSent={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
      />
    </div>
  );
}
