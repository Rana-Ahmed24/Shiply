"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { useActionStateToast } from "@/hooks/use-action-state-toast";
import { beginVerificationEditAction } from "@/lib/verification/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VerificationWizardFooterProps = {
  backHref: string;
  showEdit?: boolean;
};

function EditButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="inline-flex gap-2 rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
    >
      <Pencil className="size-4" aria-hidden />
      {pending ? "Opening editor…" : "Edit"}
    </Button>
  );
}

export function VerificationWizardFooter({
  backHref,
  showEdit = false,
}: VerificationWizardFooterProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(beginVerificationEditAction, {});
  useActionStateToast(state, {
    successTitle: "Edit mode",
    errorTitle: "Could not open editor",
  });

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
  }, [state.success, router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={backHref}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "inline-flex rounded-2xl"
        )}
      >
        Back to create listing
      </Link>
      {showEdit ? (
        <form action={formAction}>
          <EditButton />
        </form>
      ) : null}
    </div>
  );
}
