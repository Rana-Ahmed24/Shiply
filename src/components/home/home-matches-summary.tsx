"use client";

import Link from "next/link";
import { Inbox, Send } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useAppMode } from "@/lib/mode/client-store";
import type { AppMode } from "@/lib/mode/constants";
import { cn } from "@/lib/utils";

type HomeMatchesSummaryProps = {
  mode: AppMode;
  sentCount: number;
  incomingCount: number;
};

export function HomeMatchesSummary({
  mode: serverMode,
  sentCount,
  incomingCount,
}: HomeMatchesSummaryProps) {
  const mode = useAppMode(serverMode);
  const isTraveler = mode === "traveler";

  const count = isTraveler ? incomingCount : sentCount;
  const Icon = isTraveler ? Inbox : Send;
  const message = isTraveler
    ? count === 1
      ? "You have 1 incoming request"
      : `You have ${count} incoming requests`
    : count === 1
      ? "You have 1 sent request"
      : `You have ${count} sent requests`;
  const href = isTraveler ? "/matches?tab=incoming" : "/matches?tab=sent";

  return (
    <section
      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/60 px-4 py-4 shadow-soft sm:px-5"
      aria-label="Matches summary"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50">
          <Icon
            className={cn(
              "size-5",
              isTraveler ? "text-brand-teal" : "text-brand-gold"
            )}
            aria-hidden
          />
        </div>
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
      <Link
        href={href}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-xl"
        )}
      >
        View matches
      </Link>
    </section>
  );
}
