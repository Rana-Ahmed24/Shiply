import Link from "next/link";
import { redirect } from "next/navigation";

import { FlashMessageDialog } from "@/components/feedback/flash-message-dialog";
import { Container } from "@/components/layout/container";
import { MatchesPageTabs } from "@/components/matching/matches-page-tabs";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/server";
import {
  countPendingIncomingForTraveler,
  countSentMatchesForCustomer,
  getIncomingMatchesForTraveler,
  getSentMatchesForCustomer,
} from "@/lib/matching/queries";
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

  const userId = session.user.id;

  const [sent, incoming, sentCount, incomingCount] = await Promise.all([
    getSentMatchesForCustomer(userId),
    getIncomingMatchesForTraveler(userId),
    countSentMatchesForCustomer(userId),
    countPendingIncomingForTraveler(userId),
  ]);

  return (
    <Container className="space-y-8 py-10 pb-24 md:py-14 md:pb-10">
      <FlashMessageDialog messageKey={params.message} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">Matches</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Sent and incoming delivery requests. You can act as both customer and
            traveler — both lists are always available here.
          </p>
        </div>
        <Link
          href="/home"
          className={cn(buttonVariants({ variant: "ghost" }), "rounded-2xl")}
        >
          Back to home
        </Link>
      </div>

      <MatchesPageTabs
        sent={sent}
        incoming={incoming}
        sentCount={sentCount}
        incomingCount={incomingCount}
      />
    </Container>
  );
}
