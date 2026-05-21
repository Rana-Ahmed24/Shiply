import { AlertTriangle, BadgeCheck, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TravelerVerificationStatus } from "@/types/traveler-verification";

type TravelerVerificationBadgeProps = {
  status: TravelerVerificationStatus;
  /** When false, only show the verified badge (public surfaces). */
  showNonVerified?: boolean;
  className?: string;
};

const STYLES: Record<
  Exclude<TravelerVerificationStatus, "not_submitted">,
  { label: string; className: string; icon: typeof BadgeCheck }
> = {
  verified: {
    label: "Verified Traveler",
    className:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: BadgeCheck,
  },
  invalid: {
    label: "Verification incomplete",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
    icon: AlertTriangle,
  },
  pending: {
    label: "Verification under review",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
    icon: Clock,
  },
  rejected: {
    label: "Verification rejected",
    className: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
    icon: AlertTriangle,
  },
};

export function TravelerVerificationBadge({
  status,
  showNonVerified = false,
  className,
}: TravelerVerificationBadgeProps) {
  if (status === "not_submitted") return null;
  if (!showNonVerified && status !== "verified") return null;

  const config = STYLES[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-medium",
        config.className,
        className
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {config.label}
    </span>
  );
}
