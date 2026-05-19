"use client";

import { useEffect, useRef } from "react";

import { useToast } from "@/components/ui/toast-provider";
import type { AuthActionState } from "@/lib/auth/errors";

type UseActionStateToastOptions = {
  errorTitle?: string;
  successTitle?: string;
};

/**
 * Shows Shiply toasts for server action success/error (not field-level validation).
 */
export function useActionStateToast(
  state: AuthActionState,
  options: UseActionStateToastOptions = {}
) {
  const { toast } = useToast();
  const lastError = useRef<string | undefined>(undefined);
  const lastSuccess = useRef<string | undefined>(undefined);

  const errorTitle = options.errorTitle ?? "Something went wrong";
  const successTitle = options.successTitle ?? "Success";

  useEffect(() => {
    if (state.error && state.error !== lastError.current) {
      lastError.current = state.error;
      toast({
        variant: "error",
        title: errorTitle,
        description: state.error,
      });
    }
  }, [state.error, errorTitle, toast]);

  useEffect(() => {
    if (state.success && state.success !== lastSuccess.current) {
      lastSuccess.current = state.success;
      toast({
        variant: "success",
        title: successTitle,
        description: state.success,
      });
    }
  }, [state.success, successTitle, toast]);
}
