"use client";

import { useActionState } from "react";

import {
  acceptMatchAction,
  completeMatchAction,
  rejectMatchAction,
} from "@/lib/matching/actions";
import { Button } from "@/components/ui/button";
import { useActionStateToast } from "@/hooks/use-action-state-toast";
import type { MatchDetailModel } from "@/types/match";

type MatchActionsProps = {
  match: MatchDetailModel;
};

export function MatchActions({ match }: MatchActionsProps) {
  const [acceptState, acceptFormAction, acceptPending] = useActionState(
    acceptMatchAction,
    {}
  );
  const [rejectState, rejectFormAction, rejectPending] = useActionState(
    rejectMatchAction,
    {}
  );
  const [completeState, completeFormAction, completePending] = useActionState(
    completeMatchAction,
    {}
  );

  useActionStateToast(acceptState);
  useActionStateToast(rejectState);
  useActionStateToast(completeState);

  if (!match.canAccept && !match.canReject && !match.canComplete) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {match.canAccept && (
        <form action={acceptFormAction}>
          <input type="hidden" name="matchId" value={match.id} />
          <Button
            type="submit"
            disabled={acceptPending}
            className="rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
          >
            Accept match
          </Button>
        </form>
      )}
      {match.canReject && (
        <form action={rejectFormAction}>
          <input type="hidden" name="matchId" value={match.id} />
          <input type="hidden" name="reason" value="Declined by user" />
          <Button
            type="submit"
            variant="outline"
            disabled={rejectPending}
            className="rounded-2xl"
          >
            Decline
          </Button>
        </form>
      )}
      {match.canComplete && (
        <form action={completeFormAction}>
          <input type="hidden" name="matchId" value={match.id} />
          <Button
            type="submit"
            variant="secondary"
            disabled={completePending}
            className="rounded-2xl"
          >
            Mark completed
          </Button>
        </form>
      )}
    </div>
  );
}
