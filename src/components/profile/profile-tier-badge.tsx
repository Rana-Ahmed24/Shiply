import { Award } from "lucide-react";

import {
  TIER_DESCRIPTIONS,
  TIER_LABELS,
  type TravelerTier,
} from "@/lib/profile/constants";
import { cn } from "@/lib/utils";

const TIER_STYLES: Record<TravelerTier, string> = {
  bronze: "border-amber-700/40 bg-amber-900/20 text-amber-200",
  silver: "border-slate-400/40 bg-slate-500/15 text-slate-200",
  gold: "border-brand-gold/50 bg-brand-gold/15 text-brand-gold",
};

type ProfileTierBadgeProps = {
  tier: TravelerTier;
  showDescription?: boolean;
  className?: string;
};

export function ProfileTierBadge({
  tier,
  showDescription = false,
  className,
}: ProfileTierBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-sm font-medium capitalize",
        TIER_STYLES[tier],
        className
      )}
    >
      <Award className="size-4 shrink-0" aria-hidden />
      <div>
        <span>{TIER_LABELS[tier]}</span>
        {showDescription ? (
          <p className="text-xs font-normal opacity-80">
            {TIER_DESCRIPTIONS[tier]}
          </p>
        ) : null}
      </div>
    </div>
  );
}
