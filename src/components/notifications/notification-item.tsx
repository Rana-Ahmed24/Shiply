"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/format/time-ago";
import type { NotificationRealtimePayload } from "@/lib/notifications/realtime-payload";

type NotificationItemProps = {
  notification: NotificationRealtimePayload;
  onNavigate?: () => void;
  compact?: boolean;
};

export function NotificationItem({
  notification,
  onNavigate,
  compact = false,
}: NotificationItemProps) {
  const unread = !notification.readAt;

  return (
    <Link
      href={notification.linkUrl}
      onClick={onNavigate}
      className={cn(
        "block rounded-xl border px-3 py-3 transition-colors",
        unread
          ? "border-brand-teal/30 bg-brand-teal/5 hover:bg-brand-teal/10"
          : "border-transparent bg-transparent hover:bg-muted/50",
        compact ? "py-2" : "py-3"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-sm leading-snug",
            unread ? "font-semibold text-foreground" : "font-medium text-foreground/90"
          )}
        >
          {notification.title}
        </p>
        {unread ? (
          <span
            className="mt-1 size-2 shrink-0 rounded-full bg-brand-teal"
            aria-hidden
          />
        ) : null}
      </div>
      <p
        className={cn(
          "mt-0.5 text-muted-foreground",
          compact ? "line-clamp-1 text-xs" : "line-clamp-2 text-sm"
        )}
      >
        {notification.body}
      </p>
      <p className="mt-1 text-[0.65rem] text-muted-foreground">
        {formatTimeAgo(notification.createdAt)}
      </p>
    </Link>
  );
}
