"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { AcceptedMatchDetails } from "@/components/matching/accepted-match-details";
import { MatchStatusBadge } from "@/components/matching/match-status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { HomeMatchItem } from "@/types/home-match";
import { cn } from "@/lib/utils";

type AcceptedMatchRowProps = {
  match: HomeMatchItem;
};

export function AcceptedMatchRow({ match }: AcceptedMatchRowProps) {
  return (
    <li className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <MatchStatusBadge status="accepted" label="Accepted" />
            {match.acceptedAtLabel && (
              <span className="text-xs text-muted-foreground">
                {match.acceptedAtLabel}
              </span>
            )}
          </div>
          <p className="font-bold leading-snug">{match.requestTitle}</p>
          <AcceptedMatchDetails match={match} compact />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/messages/${match.id}`}
          className={cn(
            buttonVariants({ size: "sm" }),
            "rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
          )}
        >
          <MessageCircle className="mr-1.5 size-4" aria-hidden />
          Chat
        </Link>
        <Link
          href={match.href}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
        >
          Details
        </Link>
      </div>
    </li>
  );
}
