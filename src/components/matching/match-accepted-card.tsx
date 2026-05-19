"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { MatchStatusBadge } from "@/components/matching/match-status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { HomeMatchItem } from "@/types/home-match";
import { cn } from "@/lib/utils";

type MatchAcceptedCardProps = {
  match: HomeMatchItem;
  className?: string;
};

export function MatchAcceptedCard({ match, className }: MatchAcceptedCardProps) {
  const isCustomer = match.isViewerCustomer;

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

      <p className="mt-4 text-lg font-semibold leading-snug">
        {isCustomer ? (
          <>
            <span aria-hidden>🎉 </span>
            Your request was accepted by{" "}
            <span className="text-brand-teal">
              {match.counterpartyName ?? "the traveler"}
            </span>
          </>
        ) : (
          <>You accepted this request</>
        )}
      </p>

      <dl className="mt-4 grid gap-2 text-sm">
        <div>
          <dt className="text-xs uppercase text-muted-foreground">
            {isCustomer ? "Traveler" : "Customer"}
          </dt>
          <dd className="font-medium">{match.counterpartyName ?? "User"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Package</dt>
          <dd className="font-medium">{match.requestTitle}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Route</dt>
          <dd>{match.listingRoute}</dd>
        </div>
        {!isCustomer && (
          <div>
            <dt className="text-xs uppercase text-muted-foreground">
              Pickup → destination
            </dt>
            <dd>
              {match.pickupLabel} → {match.destinationLabel}
            </dd>
          </div>
        )}
        {match.estimatedArrivalLabel && (
          <div>
            <dt className="text-xs uppercase text-muted-foreground">
              Estimated arrival
            </dt>
            <dd>{match.estimatedArrivalLabel}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Reward</dt>
          <dd className="font-semibold text-brand-gold">{match.agreedPriceLabel}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/messages/${match.id}`}
          className={cn(
            buttonVariants({ size: "sm" }),
            "rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
          )}
        >
          <MessageCircle className="mr-1.5 size-4" aria-hidden />
          Open chat
        </Link>
        <Link
          href={match.href}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
        >
          View details
        </Link>
      </div>
    </div>
  );
}
