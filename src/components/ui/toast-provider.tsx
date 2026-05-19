"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ToastInput = {
  variant: "success" | "error";
  title: string;
  description?: string;
  durationMs?: number;
};

type ToastItem = ToastInput & { id: string };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const duration = input.durationMs ?? 5000;
      setToasts((prev) => [...prev, { ...input, id }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-24 z-[100] flex w-full max-w-sm flex-col gap-2 md:bottom-6"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto flex gap-3 rounded-2xl border p-4 shadow-soft-lg",
              "bg-card text-card-foreground",
              item.variant === "success"
                ? "border-brand-gold/40"
                : "border-destructive/40"
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                item.variant === "success"
                  ? "bg-brand-gold/15 text-brand-gold"
                  : "bg-destructive/15 text-destructive"
              )}
            >
              {item.variant === "success" ? (
                <CheckCircle2 className="size-5" aria-hidden />
              ) : (
                <AlertCircle className="size-5" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {item.title}
              </p>
              {item.description ? (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
