"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: (value: string) => void;
};

/** Custom replacement for browser prompt() — use instead of window.prompt(). */
export function PromptDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  defaultValue = "",
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  pending = false,
  onConfirm,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  function handleOpenChange(next: boolean) {
    if (next) {
      setValue(defaultValue);
    }
    onOpenChange(next);
  }

  function handleConfirm() {
    onConfirm(value.trim());
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="prompt-input">{label}</Label>
          <Input
            id="prompt-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="h-11 rounded-2xl"
            autoFocus
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-2xl"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={pending || !value.trim()}
            onClick={handleConfirm}
            className="h-11 rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
          >
            {pending ? "Saving…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
