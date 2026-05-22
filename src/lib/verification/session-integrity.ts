import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";

import { checkTravelerVerificationIntegrity } from "@/lib/verification/integrity";

/** Run on session restore for travelers (repairs stale verified rows). */
export const runTravelerVerificationIntegrityForSession = cache(
  async (userId: string): Promise<void> => {
    noStore();
    await checkTravelerVerificationIntegrity(userId, {
      repair: true,
      log: false,
    });
  }
);
