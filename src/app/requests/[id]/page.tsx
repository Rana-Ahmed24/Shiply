import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { RequestDangerZone } from "@/components/requests/request-danger-zone";
import { RequestLifecycleTracker } from "@/components/requests/request-lifecycle-tracker";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { TravelerAcceptPanel } from "@/components/matching/traveler-accept-panel";
import { OwnershipDisabledCta } from "@/components/ui/ownership-disabled-cta";
import { getSession } from "@/lib/auth/server";
import {
  getMatchByRequestId,
  getTravelerActiveListingsForMatching,
} from "@/lib/matching/queries";
import { EDITABLE_LIFECYCLE } from "@/lib/requests/constants";
import { getRequestById } from "@/lib/requests/queries";
import { cn } from "@/lib/utils";

type RequestDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ warning?: string; error?: string }>;
};

export default async function RequestDetailPage({
  params,
  searchParams,
}: RequestDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const session = await getSession();
  const request = await getRequestById(id, session?.user.id);

  if (!request) {
    notFound();
  }

  const isOwner = session?.user.id === request.customerId;
  const canEdit =
    isOwner && EDITABLE_LIFECYCLE.includes(request.lifecycle);
  const canCancel =
    isOwner &&
    request.lifecycle !== "cancelled" &&
    request.lifecycle !== "delivered";
  const showDangerZone = isOwner;

  const existingMatch = await getMatchByRequestId(id);
  const canOfferDelivery =
    !isOwner &&
    session?.user.id &&
    request.status === "open" &&
    request.lifecycle === "pending" &&
    (!existingMatch || existingMatch.status === "cancelled");

  const travelerListings = canOfferDelivery
    ? await getTravelerActiveListingsForMatching(session!.user.id)
    : [];

  return (
    <Container className="space-y-8 py-10 md:py-14">
      {query.error === "delete_failed" && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Could not delete this request. Run fix-customer-request-delete-policy.sql
          in the Supabase SQL Editor if delete is blocked by security rules.
        </p>
      )}
      {query.error === "delete_linked" && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          This request is linked to a delivery and cannot be deleted yet. Cancel it
          instead, or contact support.
        </p>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <RequestStatusBadge
              lifecycle={request.lifecycle}
              label={request.lifecycleLabel}
            />
            <Badge variant="secondary" className="rounded-full">
              {request.category}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {request.urgencyLabel}
            </Badge>
          </div>
          <h1 className="text-display mt-3 text-3xl">{request.title}</h1>
          {request.budgetLabel && (
            <p className="mt-2 text-lg font-medium text-brand-gold">
              Budget: {request.budgetLabel}
            </p>
          )}
          {request.neededBy && (
            <p className="mt-1 text-sm text-muted-foreground">
              Needed by {request.neededBy}
            </p>
          )}
        </div>
        {isOwner && (
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Link
                href={`/requests/${id}/edit`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-2xl"
                )}
              >
                Edit request
              </Link>
            )}
            <Link
              href="/requests"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "rounded-2xl"
              )}
            >
              All requests
            </Link>
          </div>
        )}
      </div>

      <section className="rounded-2xl border border-border/60 p-6">
        <h2 className="font-semibold">Status</h2>
        <div className="mt-4">
          <RequestLifecycleTracker current={request.lifecycle} />
        </div>
      </section>

      {request.imageUrls.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Photos</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {request.imageUrls.map((url, i) => (
              <div
                key={url}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
              >
                <Image
                  src={url}
                  alt={`Product ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border/60 p-6">
            <h2 className="font-semibold">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {request.description}
            </p>
          </section>

          {request.productLink && (
            <section className="rounded-2xl border border-border/60 p-6">
              <h2 className="font-semibold">Product link</h2>
              <a
                href={request.productLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block break-all text-sm text-brand-gold hover:underline"
              >
                {request.productLink}
              </a>
            </section>
          )}
        </div>

        <aside className="h-fit space-y-4">
          <section className="rounded-2xl border border-border/60 p-6">
            <h2 className="font-semibold">Origin preference</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {request.preferredOriginCity ||
              request.preferredOriginCountryCode
                ? [
                    request.preferredOriginCity,
                    request.preferredOriginCountryCode,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "Any country"}
            </p>
          </section>

          {isOwner && (
            <section className="rounded-2xl border border-border/60 p-6">
              <h2 className="font-bold">Offer to deliver</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This is your package request. Travelers can offer to deliver it.
              </p>
              <OwnershipDisabledCta
                label="Your request"
                tooltip="You cannot accept your own request"
              />
            </section>
          )}
          {canOfferDelivery && (
            <section className="rounded-2xl border border-border/60 p-6">
              <h2 className="font-bold">Offer to deliver</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Pick one of your active trips. Compatibility is checked before
                sending.
              </p>
              <div className="mt-4">
                <TravelerAcceptPanel requestId={id} listings={travelerListings} />
              </div>
            </section>
          )}

          {existingMatch &&
            existingMatch.status !== "cancelled" &&
            session?.user.id && (
              <section className="rounded-2xl border border-border/60 p-6">
                <h2 className="font-semibold">Delivery match</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This request has an active match.
                </p>
                <Link
                  href={`/matches/${existingMatch.id}`}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "mt-4 w-full rounded-2xl"
                  )}
                >
                  View match
                </Link>
              </section>
            )}

          {showDangerZone && (
            <section className="rounded-2xl border border-border/60 p-6">
              <RequestDangerZone requestId={id} canCancel={canCancel} />
            </section>
          )}
        </aside>
      </div>
    </Container>
  );
}
