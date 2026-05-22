import { Star } from "lucide-react";

import { ReviewStars } from "@/components/reviews/review-stars";
import { cn } from "@/lib/utils";
import type { ReviewStats } from "@/types/review";

type RatingSummaryProps = {
  stats: ReviewStats;
  label?: string;
  className?: string;
  compact?: boolean;
};

export function RatingSummary({
  stats,
  label = "Rating",
  className,
  compact = false,
}: RatingSummaryProps) {
  if (stats.totalReviews === 0 || stats.averageRating == null) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No reviews yet
      </p>
    );
  }

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-sm font-medium text-brand-gold",
          className
        )}
      >
        <Star className="size-4 fill-current" aria-hidden />
        {stats.averageRating.toFixed(1)}
        <span className="text-muted-foreground font-normal">
          ({stats.totalReviews})
        </span>
      </span>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <ReviewStars rating={stats.averageRating} size="md" />
      <div>
        <p className="text-lg font-semibold tabular-nums">
          {stats.averageRating.toFixed(1)}
        </p>
        <p className="text-xs text-muted-foreground">
          {label} · {stats.totalReviews} review
          {stats.totalReviews === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
