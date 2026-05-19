"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ActionSuccessDialog } from "@/components/feedback/action-success-dialog";
import { getFlashMessage } from "@/lib/feedback/flash-messages";

type FlashMessageDialogProps = {
  messageKey?: string;
};

export function FlashMessageDialog({ messageKey }: FlashMessageDialogProps) {
  const router = useRouter();
  const config = getFlashMessage(messageKey);
  const [open, setOpen] = useState(Boolean(config));

  useEffect(() => {
    setOpen(Boolean(config));
  }, [config]);

  const dismiss = useCallback(() => {
    if (!config) return;
    setOpen(false);
    router.replace(config.dismissPath);
    router.refresh();
  }, [config, router]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && config) {
      dismiss();
    }
  }

  if (!config) return null;

  return (
    <ActionSuccessDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={config.title}
      description={config.description}
      confirmLabel={config.confirmLabel}
      onConfirm={dismiss}
    />
  );
}
