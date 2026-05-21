import type { TravelerVerificationDocKind } from "@/types/traveler-verification";

export const TRAVELER_VERIFICATION_BUCKET = "traveler-verifications";

export const VERIFICATION_MAX_BYTES = 5 * 1024 * 1024;

export const VERIFICATION_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const DOC_FILE_NAMES: Record<TravelerVerificationDocKind, string> = {
  passport: "passport.jpg",
  selfie: "selfie.jpg",
  ticket: "ticket.jpg",
};

export const DOC_FIELD_NAMES: Record<
  TravelerVerificationDocKind,
  "passport_url" | "selfie_url" | "ticket_url"
> = {
  passport: "passport_url",
  selfie: "selfie_url",
  ticket: "ticket_url",
};

/** Storage object basename must match document kind (passport / selfie / ticket). */
export function verificationPathMatchesKind(
  path: string | null,
  kind: TravelerVerificationDocKind
): boolean {
  if (!path?.trim()) return false;
  const filename = path.split("/").pop()?.toLowerCase() ?? "";
  const prefix = DOC_FILE_NAMES[kind].replace(/\.[^.]+$/, "").toLowerCase();
  return filename.startsWith(prefix);
}
