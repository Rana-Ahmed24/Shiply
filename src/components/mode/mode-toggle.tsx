"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setAppModeAction } from "@/lib/mode/actions";
import type { AppMode } from "@/lib/mode/constants";
import { MODE_SHORT } from "@/lib/mode/constants";
import { setAppModeClient, useAppMode } from "@/lib/mode/client-store";
import { cn } from "@/lib/utils";

type ModeToggleProps = {
  mode: AppMode;
  className?: string;
};

export function ModeToggle({ mode: serverMode, className }: ModeToggleProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const mode = useAppMode(serverMode);

  function switchMode(next: AppMode) {
    if (next === mode || pending) return;

    setAppModeClient(next);

    startTransition(async () => {
      await setAppModeAction(next);
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-2xl border border-border/60 bg-muted/40 p-0.5 text-xs font-medium",
        pending && "opacity-70",
        className
      )}
      role="group"
      aria-label="Switch view mode"
    >
      {(["customer", "traveler"] as const).map((value) => (
        <button
          key={value}
          type="button"
          disabled={pending}
          onClick={() => switchMode(value)}
          className={cn(
            "rounded-xl px-3 py-1.5 transition-colors",
            mode === value
              ? "bg-brand-gold text-brand-navy shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {MODE_SHORT[value]}
        </button>
      ))}
    </div>
  );
}
