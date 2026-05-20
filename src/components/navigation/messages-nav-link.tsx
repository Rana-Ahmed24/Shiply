"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { MESSAGES_UNREAD_CHANGED_EVENT } from "@/lib/messages/unread-events";
import { cn } from "@/lib/utils";

type MessagesNavLinkProps = {
  className?: string;
};

export function MessagesNavLink({ className }: MessagesNavLinkProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/unread-count", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      setUnreadCount(data.count ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, pathname]);

  useEffect(() => {
    const onChange = () => void load();
    window.addEventListener(MESSAGES_UNREAD_CHANGED_EVENT, onChange);
    return () =>
      window.removeEventListener(MESSAGES_UNREAD_CHANGED_EVENT, onChange);
  }, [load]);

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
