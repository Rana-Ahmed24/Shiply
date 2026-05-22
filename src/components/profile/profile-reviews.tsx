import { ReviewCard } from "@/components/reviews/review-card";
import type { ReviewDisplay } from "@/types/review";

type ProfileReviewsProps = {
  reviews: ReviewDisplay[];
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
        <li key={review.id}>
          <ReviewCard review={review} />
        </li>
      ))}
    </ul>
  );
}
