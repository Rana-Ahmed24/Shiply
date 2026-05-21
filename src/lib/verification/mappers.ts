import type {
  TravelerVerificationRow,
  TravelerVerificationView,
} from "@/types/traveler-verification";

export function mapVerificationRow(
  row: TravelerVerificationRow | null,
  userId: string
): TravelerVerificationView {
  if (!row) {
    return {
      id: null,
      userId,
      status: "not_submitted",
      rejectionReason: null,
      passportPath: null,
      selfiePath: null,
      ticketPath: null,
      reviewedAt: null,
      createdAt: null,
      hasPassport: false,
      hasSelfie: false,
      hasTicket: false,
    };
  }

  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    rejectionReason: row.rejection_reason,
    passportPath: row.passport_url,
    selfiePath: row.selfie_url,
    ticketPath: row.ticket_url,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    hasPassport: Boolean(row.passport_url),
    hasSelfie: Boolean(row.selfie_url),
    hasTicket: Boolean(row.ticket_url),
  };
}
