import Link from "next/link";
import { redirect } from "next/navigation";

import { FlashMessageDialog } from "@/components/feedback/flash-message-dialog";
import { Container } from "@/components/layout/container";
import { MatchCard } from "@/components/matching/match-card";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/server";
import { getMatchesForUser } from "@/lib/matching/queries";
import { cn } from "@/lib/utils";

type MatchesPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const params = await searchParams;
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/matches");
  }

  const matches = await getMatchesForUser(session.user.id);

  return (
    <Container className="space-y-8 py-10 md:py-14">
      <FlashMessageDialog messageKey={params.message} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">Delivery matches</h1>
          <p className="mt-2 text-muted-foreground">
            Track requests, acceptances, and completed deliveries.
          </p>
        </div>
        <Link href="/home" className={cn(buttonVariants({ variant: "ghost" }), "rounded-2xl")}>
          Browse marketplace
        </Link>
      </div>

      {matches.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
          <p className="font-medium">No matches yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Request a traveler from a trip listing, or offer to deliver from an open
            request.
          </p>
          <Link
            href="/home"
            className={cn(
              buttonVariants(),
              "mt-6 inline-flex rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
            )}
          >
            Go to home
          </Link>
        </section>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <li key={match.id}>
              <MatchCard match={match} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
