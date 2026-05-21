export const TRAVELER_VERIFICATION_STATUSES = [
  "not_submitted",
  "pending",
  "verified",
  "rejected",
  "invalid",
] as const;

export type TravelerVerificationStatus =
  (typeof TRAVELER_VERIFICATION_STATUSES)[number];

export type TravelerVerificationDocKind = "passport" | "selfie" | "ticket";

export type TravelerVerificationRow = {
  id: string;
  user_id: string;
  passport_url: string | null;
  selfie_url: string | null;
  ticket_url: string | null;
  status: TravelerVerificationStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TravelerVerificationView = {
  id: string | null;
  userId: string;
  status: TravelerVerificationStatus;
  rejectionReason: string | null;
  passportPath: string | null;
  selfiePath: string | null;
  ticketPath: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  hasPassport: boolean;
  hasSelfie: boolean;
  hasTicket: boolean;
};

export type AdminVerificationQueueItem = {
  id: string;
  userId: string;
  fullName: string | null;
  email: string;
  status: TravelerVerificationStatus;
  rejectionReason: string | null;
  createdAt: string;
  passportPath: string | null;
  selfiePath: string | null;
  ticketPath: string | null;
};
