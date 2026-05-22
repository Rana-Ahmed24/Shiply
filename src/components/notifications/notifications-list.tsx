"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { NotificationItem } from "@/components/notifications/notification-item";
import { buttonVariants } from "@/components/ui/button";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import { payloadFromAppNotification } from "@/lib/notifications/realtime-payload";
import { dispatchNotificationsChanged } from "@/lib/notifications/unread-events";
import type { AppNotification } from "@/types/notification";
import { cn } from "@/lib/utils";

type NotificationsListProps = {
  initialNotifications: AppNotification[];
};

export function NotificationsList({
  initialNotifications,
}: NotificationsListProps) {
  const router = useRouter();
  const [items, setItems] = useState(() =>
    initialNotifications.map(payloadFromAppNotification)
  );
  const [pending, startTransition] = useTransition();

  const unreadCount = items.filter((n) => !n.readAt).length;

  async function handleOpen(id: string, linkUrl: string) {
    const item = items.find((n) => n.id === id);
    if (item && !item.readAt) {
      await markNotificationReadAction(id);
      setItems((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      dispatchNotificationsChanged();
    }
    router.push(linkUrl);
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      setItems((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt ?? new Date().toISOString(),
        }))
      );
      dispatchNotificationsChanged();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={pending}
            onClick={handleMarkAllRead}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-xl"
            )}
          >
            Mark all as read
          </button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">
            You&apos;re all caught up
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Match updates, messages, and payments will show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <NotificationItem
                notification={n}
                onNavigate={() => void handleOpen(n.id, n.linkUrl)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
