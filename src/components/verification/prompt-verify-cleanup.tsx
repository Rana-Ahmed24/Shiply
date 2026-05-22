"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { TravelerVerificationStatus } from "@/types/traveler-verification";

const DISMISS_KEY = "shiply_skip_listing_verify_prompt";

type PromptVerifyCleanupProps = {
  verificationStatus: TravelerVerificationStatus;
};

/**
 * Strips ?promptVerify=1 after verification is done so the listing gate
 * does not keep force-opening on every navigation/refresh.
 */
export function PromptVerifyCleanup({
  verificationStatus,
}: PromptVerifyCleanupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cleanedRef = useRef(false);

  useEffect(() => {
    if (cleanedRef.current) return;
    if (searchParams.get("promptVerify") !== "1") return;

    const settled =
      verificationStatus === "verified" ||
      verificationStatus === "pending" ||
      verificationStatus === "invalid";

    if (!settled) return;

    cleanedRef.current = true;
    sessionStorage.setItem(DISMISS_KEY, "1");
    router.replace("/listings/new", { scroll: false });
  }, [verificationStatus, searchParams, router]);

  return null;
}
