"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import { MatchAcceptedCard } from "@/components/matching/match-accepted-card";
import { MatchStatusBadge } from "@/components/matching/match-status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  acceptMatchAction,
  cancelMatchAction,
  rejectMatchAction,
} from "@/lib/matching/actions";
import { useActionStateToast } from "@/hooks/use-action-state-toast";
import type { HomeMatchItem } from "@/types/home-match";
import { cn } from "@/lib/utils";

type HomeMatchRowProps = {
  match: HomeMatchItem;
  variant: "incoming" | "sent";
  returnTo?: string;
};

export function HomeMatchRow({
  match,
  variant,
  returnTo = "/matches",
}: HomeMatchRowProps) {
  const returnTab = variant === "incoming" ? "incoming" : "sent";
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const rejectFormRef = useRef<HTMLFormElement>(null);
  const cancelFormRef = useRef<HTMLFormElement>(null);

  const [acceptState, acceptAction, acceptPending] = useActionState(
    acceptMatchAction,
    {}
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectMatchAction,
    {}
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelMatchAction,
    {}
  );

  useActionStateToast(acceptState, { successTitle: "Request accepted successfully" });
  useActionStateToast(rejectState);
  useActionStateToast(cancelState);

  if (match.displayStatus === "accepted") {
    return (
      <li>
        <MatchAcceptedCard match={match} />
      </li>
    );
  }

  const counterpartyLabel = variant === "incoming" ? "Customer" : "Traveler";

  return (
    <li className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <MatchStatusBadge
              status={match.displayStatus}
              label={match.displayStatusLabel}
            />
            {match.compatibilityScore != null && (
              <span className="text-xs text-muted-foreground">
                {match.compatibilityScore}% match
              </span>
            )}
          </div>
          <p className="font-semibold leading-snug">{match.requestTitle}</p>
          <p className="text-sm text-muted-foreground">
            {counterpartyLabel}:{" "}
            <span className="text-foreground">
              {match.counterpartyName ?? "User"}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Route: <span className="text-foreground">{match.listingRoute}</span>
          </p>
          {variant === "incoming" && (
            <p className="text-sm text-muted-foreground">
              {match.pickupLabel} → {match.destinationLabel}
            </p>
          )}
          <p className="text-sm font-medium text-brand-gold">
            {match.agreedPriceLabel}
          </p>
        </div>
      </div>

      <form
        ref={rejectFormRef}
        action={rejectAction}
        className="hidden"
        aria-hidden
      >
        <input type="hidden" name="matchId" value={match.id} />
        <input type="hidden" name="reason" value="Declined by traveler" />
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="returnTab" value={returnTab} />
      </form>
      <form
        ref={cancelFormRef}
        action={cancelAction}
        className="hidden"
        aria-hidden
      >
        <input type="hidden" name="matchId" value={match.id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <input type="hidden" name="returnTab" value={returnTab} />
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={match.href}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-xl"
          )}
        >
          View details
        </Link>

        {match.canAccept && (
          <form action={acceptAction}>
            <input type="hidden" name="matchId" value={match.id} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="returnTab" value="accepted" />
            <Button
              type="submit"
              size="sm"
              disabled={acceptPending}
              className="rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
            >
              Accept
            </Button>
          </form>
        )}

        {match.canReject && (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => setRejectOpen(true)}
              disabled={rejectPending}
            >
              Reject
            </Button>
            <ConfirmDialog
              open={rejectOpen}
              onOpenChange={setRejectOpen}
              title="Decline this request?"
              description="The customer will be notified that you declined their delivery request."
              confirmLabel="Decline request"
              destructive
              pending={rejectPending}
              onConfirm={() => {
                rejectFormRef.current?.requestSubmit();
                setRejectOpen(false);
              }}
            />
          </>
        )}

        {match.canCancel && (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => setCancelOpen(true)}
              disabled={cancelPending}
            >
              Cancel request
            </Button>
            <ConfirmDialog
              open={cancelOpen}
              onOpenChange={setCancelOpen}
              title="Cancel this request?"
              description="The traveler will no longer see this delivery request."
              confirmLabel="Cancel request"
              destructive
              pending={cancelPending}
              onConfirm={() => {
                cancelFormRef.current?.requestSubmit();
                setCancelOpen(false);
              }}
            />
          </>
        )}
      </div>
    </li>
  );
}
