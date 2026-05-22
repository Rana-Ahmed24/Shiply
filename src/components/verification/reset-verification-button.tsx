"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { useActionStateToast } from "@/hooks/use-action-state-toast";
import { resetTravelerVerificationAction } from "@/lib/verification/actions";
import { Button } from "@/components/ui/button";

function ResetSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="rounded-xl border-amber-500/40 text-amber-800 hover:bg-amber-500/10 dark:text-amber-200"
    >
      {pending ? "Resetting…" : "Start over (clear all documents)"}
    </Button>
  );
}

export function ResetVerificationButton() {
  const router = useRouter();
  const [state, formAction] = useActionState(resetTravelerVerificationAction, {});
  useActionStateToast(state, {
    successTitle: "Verification reset",
    errorTitle: "Could not reset",
  });

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
  }, [state.success, router]);

  return (
    <form action={formAction}>
      <ResetSubmit />
    </form>
  );
}
