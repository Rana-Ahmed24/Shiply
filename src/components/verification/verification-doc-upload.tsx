"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
  onUploadSuccess?: () => void;
};

function UploadButton({
  hasFileToUpload,
  uploaded,
}: {
  hasFileToUpload: boolean;
  uploaded: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || !hasFileToUpload}
      className="rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90 disabled:opacity-50"
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
  onUploadSuccess,
}: VerificationDocUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [state, formAction] = useActionState(uploadVerificationDocAction, {});
  useActionStateToast(state);

  useEffect(() => {
    if (state.success) {
      setSelectedFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploadSuccess?.();
      router.refresh();
    }
  }, [state.success, router, onUploadSuccess]);

  const hasFileToUpload = Boolean(selectedFileName);
  const showStoredUploaded = uploaded && !selectedFileName;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="kind" value={kind} />
      <div className="space-y-2">
        <Label htmlFor={`file-${kind}`}>{label}</Label>
        <p className="text-sm text-muted-foreground">{hint}</p>

        <input
          ref={fileInputRef}
          id={`file-${kind}`}
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required={!uploaded}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setSelectedFileName(file?.name ?? null);
          }}
        />

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            Choose file
          </Button>
          <p className="min-w-0 flex-1 text-sm text-foreground">
            {selectedFileName ? (
              <>
                <span className="text-muted-foreground">Selected: </span>
                <span className="font-medium break-all">{selectedFileName}</span>
              </>
            ) : showStoredUploaded ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                File on record — choose a new file to replace it.
              </span>
            ) : (
              <span className="text-muted-foreground">No file selected</span>
            )}
          </p>
        </div>

        <FieldError messages={state.fieldErrors?.file} />
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
      </div>
      <UploadButton hasFileToUpload={hasFileToUpload} uploaded={uploaded} />
    </form>
  );
}
