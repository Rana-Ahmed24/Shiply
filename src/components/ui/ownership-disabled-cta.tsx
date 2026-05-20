import { Lock, User } from "lucide-react";

import { cn } from "@/lib/utils";

type OwnershipDisabledCtaProps = {
  label: string;
  tooltip: string;
  className?: string;
  /** When false, omits top margin and full width (e.g. inline in card footers). */
  block?: boolean;
};

export function OwnershipDisabledCta({
  label,
  tooltip,
  className,
  block = true,
}: OwnershipDisabledCtaProps) {
  return (
    <span
      className={cn(block && "mt-4 block w-full", className)}
      title={tooltip}
    >
      <span
        className={cn(
          "flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl",
          "border border-border/60 bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground"
        )}
      >
        <User className="size-4 shrink-0 opacity-70" aria-hidden />
        {label}
        <Lock className="size-3.5 shrink-0 opacity-60" aria-hidden />
      </span>
      <span className="sr-only">{tooltip}</span>
    </span>
  );
}
