"use client";

import { useActionState, useRef, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  acceptMatchAction,
  cancelMatchAction,
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
  const [cancelOpen, setCancelOpen] = useState(false);
  const cancelFormRef = useRef<HTMLFormElement>(null);

  const [acceptState, acceptFormAction, acceptPending] = useActionState(
    acceptMatchAction,
    {}
  );
  const [rejectState, rejectFormAction, rejectPending] = useActionState(
    rejectMatchAction,
    {}
  );
  const [cancelState, cancelFormAction, cancelPending] = useActionState(
    cancelMatchAction,
    {}
  );
  const [completeState, completeFormAction, completePending] = useActionState(
    completeMatchAction,
    {}
  );

  useActionStateToast(acceptState);
  useActionStateToast(rejectState);
  useActionStateToast(cancelState);
  useActionStateToast(completeState);

  if (
    !match.canAccept &&
    !match.canReject &&
    !match.canCancel &&
    !match.canComplete
  ) {
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
          <input type="hidden" name="reason" value="Declined by traveler" />
          <Button
            type="submit"
            variant="outline"
            disabled={rejectPending}
            className="rounded-2xl"
          >
            Reject
          </Button>
        </form>
      )}
      {match.canCancel && (
        <>
          <form ref={cancelFormRef} action={cancelFormAction} className="hidden">
            <input type="hidden" name="matchId" value={match.id} />
            <input type="hidden" name="returnTo" value="/matches" />
          </form>
          <Button
            type="button"
            variant="outline"
            disabled={cancelPending}
            className="rounded-2xl"
            onClick={() => setCancelOpen(true)}
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
