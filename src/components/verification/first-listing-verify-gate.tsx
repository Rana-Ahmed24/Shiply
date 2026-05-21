"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TravelerVerificationStatus } from "@/types/traveler-verification";

const DISMISS_KEY = "shiply_skip_listing_verify_prompt";

type FirstListingVerifyGateProps = {
  listingCount: number;
  verificationStatus: TravelerVerificationStatus;
  children: React.ReactNode;
};

export function FirstListingVerifyGate({
  listingCount,
  verificationStatus,
  children,
}: FirstListingVerifyGateProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (listingCount > 0) return;
    if (verificationStatus === "verified" || verificationStatus === "pending") {
      return;
    }
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    setOpen(true);
  }, [listingCount, verificationStatus]);

  function continueWithout() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  }

  return (
    <>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Become a verified traveler</DialogTitle>
            <DialogDescription>
              Verified travelers gain more trust and receive more requests. You
              can still post your trip without verifying.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Link
              href="/verify-traveler"
              className={cn(
                buttonVariants(),
                "w-full justify-center rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
              )}
            >
              Become verified
            </Link>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-2xl"
              onClick={continueWithout}
            >
              Continue without verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
