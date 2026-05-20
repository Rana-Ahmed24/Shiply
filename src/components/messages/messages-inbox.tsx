"use client";

import Link from "next/link";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { formatConversationTime } from "@/lib/messages/mappers";
import { cn } from "@/lib/utils";
import type { ConversationPreview } from "@/types/chat";

type MessagesInboxProps = {
  conversations: ConversationPreview[];
  activeMatchId?: string;
  className?: string;
};

export function MessagesInbox({
  conversations,
  activeMatchId,
  className,
}: MessagesInboxProps) {
  if (conversations.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border/80 bg-muted px-6 py-16 text-center",
          className
        )}
      >
        <p className="font-medium text-foreground">No conversations yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          When a delivery match is accepted, you can message your partner here.
        </p>
        <Link
          href="/matches"
          className="mt-6 inline-block text-sm font-medium text-brand-teal hover:underline"
        >
          View matches
        </Link>
      </div>
    );
  }

  return (
    <ul className={cn("divide-y divide-border/50 rounded-2xl border border-border/60 bg-card shadow-soft", className)}>
      {conversations.map((c) => {
        const isActive = c.matchId === activeMatchId;
        return (
          <li key={c.matchId}>
            <Link
              href={c.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-card-hover",
                isActive && "bg-brand-teal/5"
              )}
            >
              <ProfileAvatar
                name={c.counterpartyName}
                avatarUrl={c.counterpartyAvatarUrl}
                size="sm"
                className="!size-12 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-medium text-foreground">
                    {c.counterpartyName ?? "Delivery chat"}
                  </p>
                  {c.lastMessageAt ? (
                    <span className="shrink-0 text-[0.65rem] text-muted-foreground">
                      {formatConversationTime(c.lastMessageAt)}
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.title}</p>
                {c.lastMessagePreview ? (
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {c.lastMessagePreview}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm italic text-muted-foreground">
                    Start the conversation
                  </p>
                )}
              </div>
              {c.unreadCount > 0 ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-teal text-[0.65rem] font-semibold text-white">
                  {c.unreadCount > 9 ? "9+" : c.unreadCount}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
