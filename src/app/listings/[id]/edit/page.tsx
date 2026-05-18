import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { DeleteListingButton } from "@/components/listings/delete-listing-button";
import { ListingForm } from "@/components/listings/listing-form";
import { buttonVariants } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/server";
import { getListingById } from "@/lib/listings/queries";
import { cn } from "@/lib/utils";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const { user } = await requireSession(
    `/login?redirectTo=${encodeURIComponent(`/listings/${id}/edit`)}`
  );

  const listing = await getListingById(id, { includeNonActive: true });
  if (!listing) {
    notFound();
  }

  if (listing.travelerId !== user.id) {
    redirect("/dashboard?error=listing_edit_denied");
  }

  return (
    <Container className="max-w-3xl space-y-8 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">Edit listing</h1>
          <p className="mt-1 text-muted-foreground">
            {listing.origin.city} → {listing.destination.city}
          </p>
        </div>
        <Link
          href={`/listings/${id}`}
          className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
        >
          View listing
        </Link>
      </div>

      <ListingForm listing={listing} />

      <div className="border-t border-border/60 pt-8">
        <h2 className="text-sm font-medium text-destructive">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently remove this listing from Shiply.
        </p>
        <div className="mt-4">
          <DeleteListingButton listingId={id} />
        </div>
      </div>
    </Container>
  );
}
