import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { RequestTravelerPanel } from "@/components/matching/request-traveler-panel";
import { getSession } from "@/lib/auth/server";
import { getListingById } from "@/lib/listings/queries";
import { getCustomerOpenRequestsForMatching } from "@/lib/matching/queries";
import { cn } from "@/lib/utils";

type ListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { id } = await params;
  const session = await getSession();
  const isOwner = session?.user.id;

  let listing = await getListingById(id);
  if (!listing && isOwner) {
    listing = await getListingById(id, { includeNonActive: true });
  }

  if (!listing) {
    notFound();
  }

  const ownsListing = session?.user.id === listing.travelerId;
  if (listing.status !== "active" && !ownsListing) {
    notFound();
  }

  const isCustomer =
    session?.user.id && session.user.id !== listing.travelerId;
  const openRequests =
    isCustomer && session
      ? await getCustomerOpenRequestsForMatching(session.user.id)
      : [];

  return (
    <Container className="space-y-8 py-10 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {listing.status !== "active" && (
              <Badge variant="outline" className="rounded-full capitalize">
                {listing.status}
              </Badge>
            )}
            {listing.verified && (
              <Badge className="rounded-full bg-brand-teal/10 text-brand-teal">
                Verified traveler
              </Badge>
            )}
          </div>
          <h1 className="text-display mt-3 text-3xl">
            {listing.origin.flag} {listing.origin.city} → {listing.destination.flag}{" "}
            {listing.destination.city}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Arrives {listing.arrives}
            {listing.departs ? ` · Departs ${listing.departs}` : ""}
          </p>
        </div>
        {ownsListing && (
          <Link
            href={`/listings/${id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-2xl"
            )}
          >
            Edit listing
          </Link>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border/60 p-6">
            <h2 className="font-semibold">Trip details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  Capacity
                </dt>
                <dd className="mt-1 font-medium">{listing.capacity}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  Service
                </dt>
                <dd className="mt-1 font-medium">{listing.service}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border/60 p-6">
            <h2 className="font-semibold">Categories</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.categories.map((cat) => (
                <Badge key={cat} variant="secondary" className="rounded-full">
                  {cat}
                </Badge>
              ))}
            </div>
          </section>

          {listing.deliveryPreferences.length > 0 && (
            <section className="rounded-2xl border border-border/60 p-6">
              <h2 className="font-semibold">Delivery preferences</h2>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {listing.deliveryPreferences.map((pref) => (
                  <li key={pref}>{pref}</li>
                ))}
              </ul>
            </section>
          )}

          {listing.notes && (
            <section className="rounded-2xl border border-border/60 p-6">
              <h2 className="font-semibold">Notes</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {listing.notes}
              </p>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-border/60 p-6">
          <h2 className="font-semibold">Traveler</h2>
          {listing.traveler ? (
            <div className="mt-4 flex items-center gap-3">
              <ProfileAvatar
                name={listing.traveler.full_name}
                avatarUrl={listing.traveler.avatar_url}
                size="md"
              />
              <div>
                <p className="font-medium">
                  {listing.traveler.full_name ?? "Traveler"}
                </p>
                {listing.rating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {listing.rating.toFixed(1)} ★ ·{" "}
                    {listing.traveler.traveler_review_count} reviews
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Unknown traveler</p>
          )}
          <Link
            href={`/profile/${listing.travelerId}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-6 w-full rounded-2xl"
            )}
          >
            View profile
          </Link>

          {isCustomer && !ownsListing && (
            <section
              id="request-delivery"
              className="mt-6 border-t border-border/60 pt-6"
            >
              <h3 className="font-semibold">Request delivery</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Link one of your open requests to this trip. We check route, dates,
                category, capacity, and verification.
              </p>
              <div className="mt-4">
                <RequestTravelerPanel
                  listingId={id}
                  requests={openRequests}
                />
              </div>
            </section>
          )}
        </aside>
      </div>
    </Container>
  );
}
