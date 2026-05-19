"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ActionSuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export function ActionSuccessDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Continue",
  onConfirm,
}: ActionSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="text-center">
        <DialogHeader className="items-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
            <CheckCircle2 className="size-7" aria-hidden />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            onClick={onConfirm}
            className="h-11 w-full rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90 sm:w-auto sm:min-w-40"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
