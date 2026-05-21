import "server-only";

import type { TravelerVerificationDocKind } from "@/types/traveler-verification";
import {
  DOC_FILE_NAMES,
  TRAVELER_VERIFICATION_BUCKET,
} from "@/lib/verification/constants";

export function verificationStoragePath(
  userId: string,
  kind: TravelerVerificationDocKind
): string {
  return `${userId}/${DOC_FILE_NAMES[kind]}`;
}

export function extensionFromFile(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "png";
  if (ext === "webp") return "webp";
  if (ext === "pdf") return "pdf";
  return "jpg";
}

/** Path with correct extension for uploads (overwrites canonical name per kind). */
export function verificationUploadPath(
  userId: string,
  kind: TravelerVerificationDocKind,
  file: File
): string {
  const ext = extensionFromFile(file);
  const base = DOC_FILE_NAMES[kind].replace(/\.[^.]+$/, "");
  return `${userId}/${base}.${ext}`;
}

export async function createSignedVerificationUrl(
  supabase: { storage: { from: (b: string) => { createSignedUrl: (path: string, expiresIn: number) => Promise<{ data: { signedUrl: string } | null; error: { message: string } | null }> } } },
  storagePath: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(TRAVELER_VERIFICATION_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
