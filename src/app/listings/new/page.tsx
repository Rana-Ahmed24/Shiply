import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ListingForm } from "@/components/listings/listing-form";
import { FirstListingVerifyGate } from "@/components/verification/first-listing-verify-gate";
import { VerificationStatusBanner } from "@/components/verification/verification-status-banner";
import { buttonVariants } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/server";
import {
  countUserListings,
  getTravelerVerification,
} from "@/lib/verification/queries";
import { cn } from "@/lib/utils";

type NewListingPageProps = {
  searchParams: Promise<{ promptVerify?: string }>;
};

export default async function NewListingPage({ searchParams }: NewListingPageProps) {
  const params = await searchParams;
  const { user } = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/listings/new?promptVerify=1")}`
  );

  const [verification, listingCount] = await Promise.all([
    getTravelerVerification(user.id),
    countUserListings(user.id),
  ]);

  const showVerificationUi = verification.status !== "verified";
  const forceVerifyPrompt = params.promptVerify === "1";

  return (
    <Container className="max-w-3xl space-y-8 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">Create listing</h1>
          <p className="mt-1 text-muted-foreground">
            Share your trip so customers can request deliveries.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {showVerificationUi ? (
            <Link
              href="/verify-traveler"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
              )}
            >
              Verify traveler account
            </Link>
          ) : null}
        </div>
      </div>

      {showVerificationUi ? (
        <VerificationStatusBanner verification={verification} />
      ) : null}

      <FirstListingVerifyGate
        listingCount={listingCount}
        verificationStatus={verification.status}
        forceOpen={forceVerifyPrompt}
      >
        <ListingForm />
      </FirstListingVerifyGate>
    </Container>
  );
}
