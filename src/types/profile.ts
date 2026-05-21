import type { TravelerTier } from "@/lib/profile/constants";
import type { UserRole } from "@/lib/auth/roles";
import type { TravelerVerificationView } from "@/types/traveler-verification";

export type ProfileVerification = {
  type: string;
  status: string;
};

export type ProfileReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string | null;
};

export type PublicProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  roles: UserRole[];
  languages: string[];
  meetup_locations: string[];
  deals_completed: number;
  traveler_tier: TravelerTier;
  traveler_rating_avg: number | null;
  traveler_review_count: number;
  customer_rating_avg: number | null;
  customer_review_count: number;
  created_at: string;
  verifications: ProfileVerification[];
  travelerVerification: TravelerVerificationView | null;
  reviews: ProfileReview[];
  is_owner: boolean;
};
