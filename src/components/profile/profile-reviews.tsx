import { Star } from "lucide-react";

import type { ProfileReview } from "@/types/profile";

type ProfileReviewsProps = {
  reviews: ProfileReview[];
};

export function ProfileReviews({ reviews }: ProfileReviewsProps) {
  if (!reviews.length) {
    return (
      <p className="text-sm text-muted-foreground">No public reviews yet.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{review.reviewer_name ?? "Anonymous"}</p>
            <div className="flex items-center gap-1 text-brand-gold">
              <Star className="size-4 fill-current" aria-hidden />
              <span className="text-sm font-semibold">{review.rating}</span>
            </div>
          </div>
          {review.comment ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {review.comment}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(review.created_at).toLocaleDateString("en-EG", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}
