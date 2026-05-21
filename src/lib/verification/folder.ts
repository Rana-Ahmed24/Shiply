const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Slug for display in storage paths (Supabase bucket folders). */
export function slugifyTravelerName(fullName: string | null | undefined): string {
  const base = (fullName ?? "").trim().toLowerCase();
  if (!base) return "traveler";

  const slug = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "traveler";
}

/**
 * Bucket folder: `{name-slug}__{userId}` for auditing in Supabase Storage.
 * Legacy uploads used `{userId}` only — both remain supported in RLS.
 */
export function verificationStorageFolder(
  userId: string,
  fullName: string | null | undefined
): string {
  return `${slugifyTravelerName(fullName)}__${userId}`;
}

/** First path segment of a stored object key. */
export function verificationFolderFromPath(storagePath: string): string {
  return storagePath.split("/")[0] ?? "";
}

export function userIdFromVerificationFolder(folder: string): string | null {
  if (UUID_RE.test(folder)) return folder;

  const idx = folder.lastIndexOf("__");
  if (idx === -1) return null;

  const id = folder.slice(idx + 2);
  return UUID_RE.test(id) ? id : null;
}

export function userOwnsVerificationFolder(
  folder: string,
  userId: string
): boolean {
  return folder === userId || userIdFromVerificationFolder(folder) === userId;
}
