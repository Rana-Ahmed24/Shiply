import Link from "next/link";

import { TravelerVerificationBadge } from "@/components/verification/traveler-verification-badge";
import { buttonVariants } from "@/components/ui/button";
import type { TravelerVerificationView } from "@/types/traveler-verification";
import { cn } from "@/lib/utils";

type VerificationStatusBannerProps = {
  verification: TravelerVerificationView;
  className?: string;
};

export function VerificationStatusBanner({
  verification,
  className,
}: VerificationStatusBannerProps) {
  const { status, rejectionReason } = verification;

  if (status === "not_submitted") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/70 bg-muted/30 p-5",
          className
        )}
      >
        <p className="font-medium text-foreground">Become a verified traveler</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Verified travelers gain more trust and receive more delivery requests.
        </p>
        <Link
          href="/verify-traveler"
          className={cn(
            buttonVariants({ size: "sm" }),
            "mt-4 inline-flex rounded-xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
          )}
        >
          Start verification
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5 shadow-soft",
        className
      )}
    >
      <TravelerVerificationBadge status={status} showNonVerified />
      {status === "pending" && (
        <p className="mt-3 text-sm text-muted-foreground">
          We are reviewing your documents. This usually takes 1–2 business days.
        </p>
      )}
      {status === "verified" && (
        <p className="mt-3 text-sm text-muted-foreground">
          Your account is verified. Customers can see your verified badge on
          listings and matches.
        </p>
      )}
      {status === "rejected" && (
        <>
          {rejectionReason ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              <span className="font-medium">Reason:</span> {rejectionReason}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-muted-foreground">
            Update your documents and submit again.
          </p>
          <Link
            href="/verify-traveler"
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "mt-4 inline-flex rounded-xl"
            )}
          >
            Resubmit verification
          </Link>
        </>
      )}
      {(status === "pending" || status === "verified") && (
        <Link
          href="/verify-traveler"
          className="mt-3 block text-sm text-brand-teal hover:underline"
        >
          View verification details
        </Link>
      )}
    </div>
  );
}
