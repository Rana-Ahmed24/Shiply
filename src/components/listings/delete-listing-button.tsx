"use client";

import { useTransition } from "react";

import { deleteListingAction } from "@/lib/listings/actions";
import { Button } from "@/components/ui/button";

type DeleteListingButtonProps = {
  listingId: string;
};

export function DeleteListingButton({ listingId }: DeleteListingButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      className="rounded-2xl border-destructive/40 text-destructive hover:bg-destructive/10"
      onClick={() => {
        if (
          !window.confirm(
            "Delete this listing permanently? This cannot be undone."
          )
        ) {
          return;
        }
        startTransition(() => deleteListingAction(listingId));
      }}
    >
      {pending ? "Deleting…" : "Delete listing"}
    </Button>
  );
}
