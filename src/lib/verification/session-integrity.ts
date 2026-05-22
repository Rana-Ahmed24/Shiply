import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import { checkTravelerVerificationIntegrity } from "@/lib/verification/integrity";

/**
 * Optional background repair — call only from verification pages, not from getSession().
 */
export async function runTravelerVerificationIntegrityForSession(
  userId: string
): Promise<void> {
  noStore();
  await checkTravelerVerificationIntegrity(userId, { repair: true, log: false });
}
