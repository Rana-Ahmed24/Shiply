import { ReviewStars } from "@/components/reviews/review-stars";
import { cn } from "@/lib/utils";
import type { ReviewDisplay } from "@/types/review";

type ReviewCardProps = {
  review: ReviewDisplay;
  className?: string;
};

function roleLabel(role: "customer" | "traveler") {
  return role === "traveler" ? "Traveler" : "Customer";
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-4 shadow-soft",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-semibold text-foreground">
            {review.reviewerName ?? "Anonymous"}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {roleLabel(review.reviewerRole)}
            </span>
            {" · reviewed "}
            <span className="font-medium text-foreground/80">
              {review.revieweeName ?? "user"}
            </span>
            {" ("}
            {roleLabel(review.revieweeRole)}
            {")"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ReviewStars rating={review.rating} size="md" />
          <span className="text-sm font-semibold tabular-nums">
            {review.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {review.comment ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {review.comment}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-muted-foreground">
        {new Date(review.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </article>
  );
}
