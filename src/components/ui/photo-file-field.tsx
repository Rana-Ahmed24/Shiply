"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function formatFileLabel(files: FileList | null, emptyLabel: string): string {
  if (!files || files.length === 0) return emptyLabel;
  if (files.length === 1) return files[0].name;
  return `${files.length} files: ${Array.from(files)
    .map((f) => f.name)
    .join(", ")}`;
}

export type PhotoFileFieldProps = {
  id?: string;
  name: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  /** Shown when no file is selected */
  emptyLabel?: string;
  /** Primary action button */
  buttonLabel?: string;
  buttonLabelPending?: string;
  className?: string;
  disabled?: boolean;
  pending?: boolean;
  /** After a file is chosen, submit the parent form immediately */
  autoSubmitOnSelect?: boolean;
  formRef?: React.RefObject<HTMLFormElement | null>;
};

export function PhotoFileField({
  id: idProp,
  name,
  label,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  multiple = false,
  emptyLabel = "No file chosen",
  buttonLabel = "Upload photo",
  buttonLabelPending = "Uploading…",
  className,
  disabled = false,
  pending = false,
  autoSubmitOnSelect = false,
  formRef,
}: PhotoFileFieldProps) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [statusText, setStatusText] = useState(emptyLabel);

  function openPicker() {
    if (disabled || pending) return;
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    setStatusText(formatFileLabel(files, emptyLabel));

    if (autoSubmitOnSelect && files?.length) {
      const form = formRef?.current ?? inputRef.current?.form;
      form?.requestSubmit();
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}

      <p
        className="min-h-5 text-sm text-muted-foreground"
        aria-live="polite"
        id={`${inputId}-status`}
      >
        {statusText}
      </p>

      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled || pending}
        onChange={handleChange}
        className="sr-only"
        aria-describedby={`${inputId}-status`}
      />

      <Button
        type="button"
        size="sm"
        disabled={disabled || pending}
        onClick={openPicker}
        className="h-11 rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
      >
        {pending ? buttonLabelPending : buttonLabel}
      </Button>
    </div>
  );
}
