import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MessagesNavLinkProps = {
  unreadCount: number;
  className?: string;
};

export function MessagesNavLink({ unreadCount, className }: MessagesNavLinkProps) {
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
