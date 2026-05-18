import { REQUEST_LIFECYCLE_OPTIONS } from "@/lib/requests/constants";
import { cn } from "@/lib/utils";
import type { RequestLifecycle } from "@/types/request";

const TRACK_STEPS = REQUEST_LIFECYCLE_OPTIONS.filter(
  (o) => o.value !== "cancelled"
);

type RequestLifecycleTrackerProps = {
  current: RequestLifecycle;
  className?: string;
};

function stepIndex(lifecycle: RequestLifecycle): number {
  if (lifecycle === "cancelled") return -1;
  return TRACK_STEPS.findIndex((s) => s.value === lifecycle);
}

export function RequestLifecycleTracker({
  current,
  className,
}: RequestLifecycleTrackerProps) {
  if (current === "cancelled") {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        This request was cancelled.
      </p>
    );
  }

  const activeIndex = stepIndex(current);

  return (
    <ol
      className={cn(
        "grid gap-2 sm:grid-cols-5 sm:gap-0 sm:divide-x sm:divide-border/60",
        className
      )}
    >
      {TRACK_STEPS.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;

        return (
          <li
            key={step.value}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-3 text-center sm:py-4",
              done && "text-brand-teal",
              active && "font-semibold text-brand-gold",
              !done && !active && "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                done && "border-brand-teal bg-brand-teal/15",
                active && "border-brand-gold bg-brand-gold/15",
                !done && !active && "border-border"
              )}
            >
              {done ? "✓" : index + 1}
            </span>
            <span className="text-xs sm:text-sm">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
