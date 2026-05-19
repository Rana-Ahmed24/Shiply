import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { MatchChat } from "@/components/messages/match-chat";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/server";
import { getMatchHomeItem } from "@/lib/matching/queries";
import { getMatchMessages } from "@/lib/messages/queries";
import { cn } from "@/lib/utils";

type MatchChatPageProps = {
  params: Promise<{ matchId: string }>;
};

export default async function MatchChatPage({ params }: MatchChatPageProps) {
  const { matchId } = await params;
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=/messages/${matchId}`);
  }

  const match = await getMatchHomeItem(matchId, session.user.id);
  if (!match) {
    notFound();
  }

  const messages = await getMatchMessages(matchId);

  return (
    <Container className="flex max-w-2xl flex-col gap-6 py-8 pb-24 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{match.requestTitle}</h1>
          <p className="text-sm text-muted-foreground">
            Chat with {match.counterpartyName ?? "your match"}
          </p>
        </div>
        <Link
          href={match.href}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-xl")}
        >
          Match details
        </Link>
      </div>

      <MatchChat
        matchId={matchId}
        userId={session.user.id}
        initialMessages={messages}
      />
    </Container>
  );
}
