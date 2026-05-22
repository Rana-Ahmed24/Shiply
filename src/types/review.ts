export type ReviewPartyRole = "customer" | "traveler";

export type ReviewDisplay = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerId: string;
  reviewerName: string | null;
  revieweeId: string;
  revieweeName: string | null;
  reviewerRole: ReviewPartyRole;
  revieweeRole: ReviewPartyRole;
};

export type ReviewStats = {
  averageRating: number | null;
  totalReviews: number;
};

export type MatchReviewContext = {
  matchId: string;
  matchCompleted: boolean;
  isParticipant: boolean;
  canReview: boolean;
  alreadyReviewed: boolean;
  reviewerRole: ReviewPartyRole | null;
  revieweeRole: ReviewPartyRole | null;
  revieweeId: string | null;
  revieweeName: string | null;
  submittedReview: {
    rating: number;
    comment: string | null;
    createdAt: string;
  } | null;
};

export type AdminReviewRow = {
  id: string;
  matchId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  isPublic: boolean;
  isFlagged: boolean;
  removedAt: string | null;
  reviewerId: string;
  reviewerName: string | null;
  revieweeId: string;
  revieweeName: string | null;
  reviewerRole: ReviewPartyRole;
  revieweeRole: ReviewPartyRole;
};
