import "server-only";

import { revalidatePath } from "next/cache";

/** Paths that show traveler verification UI — avoid revalidating `/` (layout storm). */
export function revalidateVerificationSurfaces() {
  revalidatePath("/verify-traveler");
  revalidatePath("/listings/new");
  revalidatePath("/profile");
  revalidatePath("/admin/verifications");
}
