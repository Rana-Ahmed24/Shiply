"use client";

import { useState, useTransition } from "react";

import {
  cancelRequestAction,
  deleteRequestAction,
} from "@/lib/requests/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type RequestDangerZoneProps = {
  requestId: string;
  canCancel: boolean;
};

export function RequestDangerZone({
  requestId,
  canCancel,
}: RequestDangerZoneProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const cancelAction = cancelRequestAction.bind(null, requestId);
  const deleteAction = deleteRequestAction.bind(null, requestId);

  function handleCancel() {
    startTransition(() => {
      cancelAction();
    });
  }

  function handleDelete() {
    startTransition(() => {
      deleteAction();
    });
  }

  return (
    <div className="space-y-6">
      {canCancel && (
        <div>
          <h2 className="text-sm font-medium">Cancel request</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mark as cancelled — travelers will no longer see it, but you can
            still view it in your list.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setCancelOpen(true)}
            className="mt-4 rounded-2xl border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            {pending ? "Cancelling…" : "Cancel request"}
          </Button>
          <ConfirmDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            title="Cancel request"
            description="Travelers will no longer be able to accept this request."
            confirmLabel="Cancel request"
            cancelLabel="Keep request"
            destructive
            pending={pending}
            onConfirm={handleCancel}
          />
        </div>
      )}

      <div className="border-t border-border/60 pt-6">
        <h2 className="text-sm font-medium text-destructive">Delete request</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently remove this request and its data. This cannot be undone.
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => setDeleteOpen(true)}
          className="mt-4 rounded-2xl border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          {pending ? "Deleting…" : "Delete request"}
        </Button>
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete request"
          description="This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          destructive
          pending={pending}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
