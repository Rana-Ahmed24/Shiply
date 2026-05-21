"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Passport", doneKey: "passport" as const },
  { id: 2, label: "Selfie", doneKey: "selfie" as const },
  { id: 3, label: "Flight ticket", doneKey: "ticket" as const },
  { id: 4, label: "Review & submit", doneKey: null },
];

type VerificationStepNavProps = {
  activeStep: number;
  onStepChange: (step: number) => void;
  hasPassport: boolean;
  hasSelfie: boolean;
  hasTicket: boolean;
  className?: string;
};

export function VerificationStepNav({
  activeStep,
  onStepChange,
  hasPassport,
  hasSelfie,
  hasTicket,
  className,
}: VerificationStepNavProps) {
  const done = {
    passport: hasPassport,
    selfie: hasSelfie,
    ticket: hasTicket,
  };

  return (
    <nav
      className={cn("flex flex-wrap gap-2", className)}
      aria-label="Verification steps"
    >
      {STEPS.map((step) => {
        const isActive = activeStep === step.id;
        const isComplete =
          step.doneKey !== null ? done[step.doneKey] : false;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepChange(step.id)}
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-gold/50 bg-brand-gold/20 text-brand-gold"
                : isComplete
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
                  : "border-border/80 text-muted-foreground hover:border-border hover:bg-muted"
            )}
          >
            {isComplete && !isActive ? (
              <Check className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-xs",
                  isActive
                    ? "bg-brand-gold text-brand-navy"
                    : "border border-current"
                )}
              >
                {step.id}
              </span>
            )}
            <span>{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
