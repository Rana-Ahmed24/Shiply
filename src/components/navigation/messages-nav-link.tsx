"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { MESSAGES_UNREAD_CHANGED_EVENT } from "@/lib/messages/unread-events";
import { cn } from "@/lib/utils";

type MessagesNavLinkProps = {
  className?: string;
};

const UNREAD_POLL_MS = 120_000;
const UNREAD_EVENT_DEBOUNCE_MS = 2_000;

export function MessagesNavLink({ className }: MessagesNavLinkProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const loadInFlightRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    try {
      const res = await fetch("/api/messages/unread-count", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      setUnreadCount(data.count ?? 0);
    } catch {
      /* ignore */
    } finally {
      loadInFlightRef.current = false;
    }
  }, []);

  const scheduleLoad = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      void load();
    }, UNREAD_EVENT_DEBOUNCE_MS);
  }, [load]);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), UNREAD_POLL_MS);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const onChange = () => scheduleLoad();
    window.addEventListener(MESSAGES_UNREAD_CHANGED_EVENT, onChange);
    return () => {
      window.removeEventListener(MESSAGES_UNREAD_CHANGED_EVENT, onChange);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [scheduleLoad]);

  const label =
    unreadCount > 0
      ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
      : "Messages";

  return (
    <Link
      href="/messages"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative rounded-2xl text-muted-foreground hover:text-foreground",
        className
      )}
      aria-label={label}
      title="Messages"
    >
      <MessageSquare className="size-5" aria-hidden />
      {unreadCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-brand-teal px-1 text-[0.6rem] font-bold leading-none text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
