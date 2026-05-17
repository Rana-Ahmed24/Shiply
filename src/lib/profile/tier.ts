import type { TravelerTier } from "@/lib/profile/constants";
import { TIER_THRESHOLDS } from "@/lib/profile/constants";

export function resolveTravelerTier(dealsCompleted: number): TravelerTier {
  if (dealsCompleted >= TIER_THRESHOLDS.gold) return "gold";
  if (dealsCompleted >= TIER_THRESHOLDS.silver) return "silver";
  return "bronze";
}

export function tierProgress(dealsCompleted: number) {
  const tier = resolveTravelerTier(dealsCompleted);
  if (tier === "gold") {
    return { tier, current: dealsCompleted, next: null, label: "Max tier reached" };
  }
  if (tier === "silver") {
    return {
      tier,
      current: dealsCompleted,
      next: TIER_THRESHOLDS.gold,
      label: `${TIER_THRESHOLDS.gold - dealsCompleted} deals to Gold`,
    };
  }
  return {
    tier,
    current: dealsCompleted,
    next: TIER_THRESHOLDS.silver,
    label: `${TIER_THRESHOLDS.silver - dealsCompleted} deals to Silver`,
  };
}
