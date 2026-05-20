import Link from "next/link";

import { MatchStatusBadge } from "@/components/matching/match-status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { MatchCardModel } from "@/types/match";
import { cn } from "@/lib/utils";

type MatchCardProps = {
  match: MatchCardModel;
  className?: string;
};

export function MatchCard({ match, className }: MatchCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-soft",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{match.requestTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{match.listingRoute}</p>
        </div>
        <MatchStatusBadge
          status={match.displayStatus}
          label={match.displayStatusLabel}
        />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="font-medium text-brand-gold">{match.agreedPriceLabel}</span>
        {match.compatibilityScore != null && (
          <span className="text-muted-foreground">
            Score {match.compatibilityScore}/100
          </span>
        )}
        {match.counterpartyName && (
          <span className="text-muted-foreground">
            {match.counterpartyRoleLabel}:{" "}
            <span className="font-medium text-foreground">
              {match.counterpartyName}
            </span>
          </span>
        )}
      </div>

      <Link
        href={match.href}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-2xl")}
      >
        View match
      </Link>
    </article>
  );
}
