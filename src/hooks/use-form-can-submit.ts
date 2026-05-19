"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export function useFormCanSubmit(
  formRef: RefObject<HTMLFormElement | null>,
  resetKey: string,
  validate?: (form: HTMLFormElement) => boolean
) {
  const [canSubmit, setCanSubmit] = useState(false);

  const run = useCallback(() => {
    const form = formRef.current;
    if (!form) {
      setCanSubmit(false);
      return;
    }
    setCanSubmit(validate ? validate(form) : form.checkValidity());
  }, [formRef, validate]);

  useEffect(() => {
    run();
    const form = formRef.current;
    if (!form) return;

    form.addEventListener("input", run);
    form.addEventListener("change", run);
    return () => {
      form.removeEventListener("input", run);
      form.removeEventListener("change", run);
    };
  }, [formRef, run, resetKey]);

  return canSubmit;
}
