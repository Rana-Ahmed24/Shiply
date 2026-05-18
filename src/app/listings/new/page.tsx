import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ListingForm } from "@/components/listings/listing-form";
import { buttonVariants } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

export default async function NewListingPage() {
  await requireSession(
    `/login?redirectTo=${encodeURIComponent("/listings/new")}`
  );

  return (
    <Container className="max-w-3xl space-y-8 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">Create listing</h1>
          <p className="mt-1 text-muted-foreground">
            Share your trip so customers can request deliveries.
          </p>
        </div>
        <Link
          href="/home"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
        >
          Back to dashboard
        </Link>
      </div>
      <ListingForm />
    </Container>
  );
}
