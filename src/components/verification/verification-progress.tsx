import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type VerificationProgressProps = {
  hasPassport: boolean;
  hasSelfie: boolean;
  hasTicket: boolean;
  className?: string;
};

const STEPS = [
  { key: "passport" as const, label: "Passport" },
  { key: "selfie" as const, label: "Selfie" },
  { key: "ticket" as const, label: "Ticket" },
];

export function VerificationProgress({
  hasPassport,
  hasSelfie,
  hasTicket,
  className,
}: VerificationProgressProps) {
  const done = {
    passport: hasPassport,
    selfie: hasSelfie,
    ticket: hasTicket,
  };

  return (
    <ul
      className={cn(
        "flex flex-wrap gap-3 text-sm",
        className
      )}
      aria-label="Verification document progress"
    >
      {STEPS.map((step) => (
        <li
          key={step.key}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1",
            done[step.key]
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-border/80 text-muted-foreground"
          )}
        >
          {done[step.key] ? (
            <Check className="size-3.5" aria-hidden />
          ) : (
            <span className="size-3.5 rounded-full border border-current" />
          )}
          {step.label}
          {done[step.key] ? " ✓" : ""}
        </li>
      ))}
    </ul>
  );
}
