export function isRequestImagesBucketMissing(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("bucket not found") ||
    normalized.includes("bucket does not exist") ||
    normalized.includes("request-images is missing") ||
    normalized.includes("image storage is not set up")
  );
}

/** Upload blocked by storage.objects RLS (policies not applied or wrong). */
export function isRequestImagesStoragePolicyError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("row-level security") ||
    normalized.includes("violates row-level security") ||
    normalized.includes("storage policies")
  );
}

export function isRequestImagesUploadSkippable(message: string): boolean {
  return (
    isRequestImagesBucketMissing(message) ||
    isRequestImagesStoragePolicyError(message)
  );
}

export function hasRequestImageFiles(formData: FormData): boolean {
  return formData
    .getAll("images")
    .some((f) => f instanceof File && f.size > 0);
}

/** Override in .env if your Supabase bucket id differs (e.g. REQUEST-IMAGES). */
export function getRequestImagesBucket(): string {
  return (
    process.env.NEXT_PUBLIC_REQUEST_IMAGES_BUCKET?.trim() || "request-images"
  );
}

export const REQUEST_IMAGES_BUCKET = getRequestImagesBucket();

function devLog(label: string, payload: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[request-images] ${label}`, payload);
  }
}

export { devLog as logRequestImageDebug };
