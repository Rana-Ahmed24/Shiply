"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { FieldError } from "@/components/auth/field-error";
import { useActionStateToast } from "@/hooks/use-action-state-toast";
import { uploadVerificationDocAction } from "@/lib/verification/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { TravelerVerificationDocKind } from "@/types/traveler-verification";

type VerificationDocUploadProps = {
  kind: TravelerVerificationDocKind;
  label: string;
  hint: string;
  uploaded: boolean;
  disabled?: boolean;
};

function UploadButton({ uploaded }: { uploaded: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
    >
      {pending ? "Uploading…" : uploaded ? "Replace file" : "Upload"}
    </Button>
  );
}

export function VerificationDocUpload({
  kind,
  label,
  hint,
  uploaded,
  disabled,
}: VerificationDocUploadProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(uploadVerificationDocAction, {});
  useActionStateToast(state);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="kind" value={kind} />
      <div className="space-y-2">
        <Label htmlFor={`file-${kind}`}>{label}</Label>
        <p className="text-sm text-muted-foreground">{hint}</p>
        <input
          id={`file-${kind}`}
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required={!uploaded}
          disabled={disabled}
          className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-muted file:px-4 file:py-2"
        />
        {uploaded ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Uploaded — you can replace this file before submitting.
          </p>
        ) : null}
        <FieldError messages={state.fieldErrors?.file} />
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
      </div>
      <UploadButton uploaded={uploaded} />
    </form>
  );
}
