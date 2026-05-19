"use client";

import { useState, useTransition } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteListingAction } from "@/lib/listings/actions";
import { Button } from "@/components/ui/button";

type DeleteListingButtonProps = {
  listingId: string;
};

export function DeleteListingButton({ listingId }: DeleteListingButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(() => {
      deleteListingAction(listingId);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="rounded-2xl border-destructive/40 text-destructive hover:bg-destructive/10"
      >
        {pending ? "Deleting…" : "Delete listing"}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete listing"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        pending={pending}
        onConfirm={handleDelete}
      />
    </>
  );
}
