"use client";

import Link from "next/link";
import { CheckCircle2, Inbox, Send } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useAppMode } from "@/lib/mode/client-store";
import type { AppMode } from "@/lib/mode/constants";
import { cn } from "@/lib/utils";

type HomeMatchesSummaryProps = {
  mode: AppMode;
  sentCount: number;
  incomingCount: number;
  customerAcceptedCount: number;
  travelerAcceptedCount: number;
};

export function HomeMatchesSummary({
  mode: serverMode,
  sentCount,
  incomingCount,
  customerAcceptedCount,
  travelerAcceptedCount,
}: HomeMatchesSummaryProps) {
  const mode = useAppMode(serverMode);
  const isTraveler = mode === "traveler";

  const pendingCount = isTraveler ? incomingCount : sentCount;
  const acceptedCount = isTraveler ? travelerAcceptedCount : customerAcceptedCount;

  const PendingIcon = isTraveler ? Inbox : Send;

  const pendingMessage =
    pendingCount === 1
      ? isTraveler
        ? "You have 1 incoming request"
        : "You have 1 sent request"
      : isTraveler
        ? `You have ${pendingCount} incoming requests`
        : `You have ${pendingCount} sent requests`;

  const acceptedMessage =
    acceptedCount === 1
      ? isTraveler
        ? "You accepted 1 request"
        : "1 request accepted"
      : isTraveler
        ? `You accepted ${acceptedCount} requests`
        : `${acceptedCount} requests accepted`;

  const pendingHref = isTraveler ? "/matches?tab=incoming" : "/matches?tab=sent";

  return (
    <section className="space-y-3" aria-label="Matches summary">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/60 px-4 py-4 shadow-soft sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50">
            <PendingIcon
              className={cn(
                "size-5",
                isTraveler ? "text-brand-teal" : "text-brand-gold"
              )}
              aria-hidden
            />
          </div>
          <p className="text-sm font-medium text-foreground">{pendingMessage}</p>
        </div>
        <Link
          href={pendingHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-xl"
          )}
        >
          View matches
        </Link>
      </div>

      {acceptedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-teal/30 bg-brand-teal/5 px-4 py-4 shadow-soft sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal/15">
              <CheckCircle2 className="size-5 text-brand-teal" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">{acceptedMessage}</p>
          </div>
          <Link
            href="/matches?tab=accepted"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-xl border-brand-teal/40 text-brand-teal"
            )}
          >
            View accepted
          </Link>
        </div>
      )}
    </section>
  );
}
