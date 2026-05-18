"use client";

import { useFormStatus } from "react-dom";

import {
  cancelRequestAction,
  deleteRequestAction,
} from "@/lib/requests/actions";
import { Button } from "@/components/ui/button";

type RequestDangerZoneProps = {
  requestId: string;
  canCancel: boolean;
};

function PendingButton({
  label,
  pendingLabel,
  variant = "outline",
}: {
  label: string;
  pendingLabel: string;
  variant?: "outline" | "destructive";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      className="rounded-2xl border-destructive/40 text-destructive hover:bg-destructive/10"
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function RequestDangerZone({
  requestId,
  canCancel,
}: RequestDangerZoneProps) {
  const cancelAction = cancelRequestAction.bind(null, requestId);
  const deleteAction = deleteRequestAction.bind(null, requestId);

  return (
    <div className="space-y-6">
      {canCancel && (
        <div>
          <h2 className="text-sm font-medium">Cancel request</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mark as cancelled — travelers will no longer see it, but you can
            still view it in your list.
          </p>
          <form
            action={cancelAction}
            className="mt-4"
            onSubmit={(e) => {
              if (
                !window.confirm(
                  "Cancel this request? Travelers will no longer be able to accept it."
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <PendingButton label="Cancel request" pendingLabel="Cancelling…" />
          </form>
        </div>
      )}

      <div className="border-t border-border/60 pt-6">
        <h2 className="text-sm font-medium text-destructive">Delete request</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently remove this request and its data. This cannot be undone.
        </p>
        <form
          action={deleteAction}
          className="mt-4"
          onSubmit={(e) => {
            if (
              !window.confirm(
                "Delete this request permanently? This cannot be undone."
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <PendingButton
            label="Delete request"
            pendingLabel="Deleting…"
          />
        </form>
      </div>
    </div>
  );
}
