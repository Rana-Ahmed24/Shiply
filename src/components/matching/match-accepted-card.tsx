"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { AcceptedMatchDetails } from "@/components/matching/accepted-match-details";
import { MatchStatusBadge } from "@/components/matching/match-status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { HomeMatchItem } from "@/types/home-match";
import { cn } from "@/lib/utils";

type MatchAcceptedCardProps = {
  match: HomeMatchItem;
  className?: string;
};

export function MatchAcceptedCard({ match, className }: MatchAcceptedCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-teal/40 bg-gradient-to-br from-brand-teal/10 via-card to-card p-5 shadow-soft",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <MatchStatusBadge status="accepted" label="Accepted" />
        {match.acceptedAtLabel && (
          <span className="text-xs text-muted-foreground">
            Accepted {match.acceptedAtLabel}
          </span>
        )}
      </div>

      <div className="mt-4">
        <AcceptedMatchDetails match={match} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
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
    </div>
  );
}
