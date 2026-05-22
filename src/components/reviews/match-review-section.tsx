import { ReviewForm } from "@/components/reviews/review-form";
import { getMatchReviewContext } from "@/lib/reviews/queries";

type MatchReviewSectionProps = {
  matchId: string;
  userId: string;
};

export async function MatchReviewSection({
  matchId,
  userId,
}: MatchReviewSectionProps) {
  const context = await getMatchReviewContext(matchId, userId);

  if (!context.isParticipant) {
    return null;
  }

  return <ReviewForm context={context} />;
}
