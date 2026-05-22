"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { NotificationItem } from "@/components/notifications/notification-item";
import { useToast } from "@/components/ui/toast-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificationsRealtime } from "@/hooks/use-notifications-realtime";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import {
  dispatchNotificationsChanged,
  NOTIFICATIONS_CHANGED_EVENT,
} from "@/lib/notifications/unread-events";
import type { NotificationRealtimePayload } from "@/lib/notifications/realtime-payload";
import { cn } from "@/lib/utils";

type NotificationsBellProps = {
  userId: string;
  className?: string;
};

export function NotificationsBell({ userId, className }: NotificationsBellProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationRealtimePayload[]>([]);
  const loadInFlightRef = useRef(false);

  const loadUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      setUnreadCount(data.count ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  const loadRecent = useCallback(async () => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    try {
      const res = await fetch("/api/notifications/recent?limit=12", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        items?: NotificationRealtimePayload[];
      };
      setItems(data.items ?? []);
    } catch {
      /* ignore */
    } finally {
      loadInFlightRef.current = false;
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadUnread(), loadRecent()]);
  }, [loadUnread, loadRecent]);

  const handleRealtimeInsert = useCallback(
    (n: NotificationRealtimePayload) => {
      setItems((prev) => {
        if (prev.some((p) => p.id === n.id)) return prev;
        return [n, ...prev].slice(0, 12);
      });
      if (!n.readAt) {
        setUnreadCount((c) => c + 1);
      }
      toast({
        variant: "success",
        title: n.title,
        description: n.body,
      });
    },
    [toast]
  );

  useNotificationsRealtime({
    userId,
    onInsert: handleRealtimeInsert,
  });

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onChange = () => void refresh();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChange);
    return () =>
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChange);
  }, [refresh]);

  useEffect(() => {
    if (open) void loadRecent();
  }, [open, loadRecent]);

  async function handleItemClick(id: string) {
    const item = items.find((n) => n.id === id);
    if (item && !item.readAt) {
      await markNotificationReadAction(id);
      setItems((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      dispatchNotificationsChanged();
    }
    setOpen(false);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsReadAction();
    setItems((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
    );
    setUnreadCount(0);
    dispatchNotificationsChanged();
  }

  const label =
    unreadCount > 0
      ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
      : "Notifications";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative rounded-2xl text-muted-foreground hover:text-foreground",
          className
        )}
        aria-label={label}
        title="Notifications"
      >
        <Bell className="size-5" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-brand-teal px-1 text-[0.65rem] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(100vw-2rem,22rem)] rounded-2xl p-0"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              className="text-xs font-medium text-brand-teal hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <div className="max-h-[min(60vh,20rem)] overflow-y-auto p-1">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </p>
          ) : (
            items.map((n) => (
              <div key={n.id} className="px-0.5 py-0.5">
                <NotificationItem
                  notification={n}
                  compact
                  onNavigate={() => void handleItemClick(n.id)}
                />
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border/60 p-2">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full rounded-xl"
            )}
          >
            View all
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
