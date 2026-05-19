import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { FlashMessageDialog } from "@/components/feedback/flash-message-dialog";
import { Container } from "@/components/layout/container";
import { CompatibilityPanel } from "@/components/matching/compatibility-panel";
import { MatchActions } from "@/components/matching/match-actions";
import { MatchStatusBadge } from "@/components/matching/match-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/server";
import { getMatchById } from "@/lib/matching/queries";
import type { CompatibilityResult } from "@/types/match";
import { cn } from "@/lib/utils";

type MatchDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

export default async function MatchDetailPage({
  params,
  searchParams,
}: MatchDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=/matches/${id}`);
  }

  const match = await getMatchById(id, session.user.id);
  if (!match) {
    notFound();
  }

  const compatFromFactors: CompatibilityResult | null =
    match.factors.length > 0
      ? {
          score: match.compatibilityScore ?? 0,
          factors: match.factors,
          canMatch: true,
        }
      : null;

  return (
    <Container className="space-y-8 py-10 md:py-14">
      <FlashMessageDialog messageKey={query.message} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <MatchStatusBadge
            status={match.displayStatus}
            label={match.displayStatusLabel}
          />
          <h1 className="text-display mt-3 text-3xl">{match.requestTitle}</h1>
          <p className="mt-2 text-muted-foreground">{match.listingRoute}</p>
          <p className="mt-1 text-lg font-medium text-brand-gold">
            {match.agreedPriceLabel}
          </p>
        </div>
        <Link
          href="/matches"
          className={cn(buttonVariants({ variant: "ghost" }), "rounded-2xl")}
        >
          All matches
        </Link>
      </div>

      <section className="rounded-2xl border border-border/60 p-6">
        <h2 className="font-semibold">Actions</h2>
        <div className="mt-4">
          <MatchActions match={match} />
          {match.isInitiator && match.displayStatus === "requested" && (
            <p className="mt-3 text-sm text-muted-foreground">
              Waiting for the other party to accept your request.
            </p>
          )}
        </div>
      </section>

      {compatFromFactors && (
        <section className="rounded-2xl border border-border/60 p-6">
          <h2 className="font-semibold">Compatibility</h2>
          <div className="mt-4">
            <CompatibilityPanel result={compatFromFactors} />
          </div>
        </section>
      )}

      {match.cancellationReason && match.displayStatus === "rejected" && (
        <section className="rounded-2xl border border-border/60 p-6">
          <h2 className="font-semibold">Decline reason</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {match.cancellationReason}
          </p>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/listings/${match.listingId}`}
          className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
        >
          View trip
        </Link>
        <Link
          href={`/requests/${match.requestId}`}
          className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
        >
          View request
        </Link>
      </div>
    </Container>
  );
}
