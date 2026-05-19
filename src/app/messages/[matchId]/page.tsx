import { notFound, redirect } from "next/navigation";

import { ChatRoom } from "@/components/messages/chat-room";
import { MessagesInbox } from "@/components/messages/messages-inbox";
import { Container } from "@/components/layout/container";
import { getSession } from "@/lib/auth/server";
import {
  getConversationMeta,
  getConversationsForUser,
  getMatchMessages,
  markMatchMessagesRead,
} from "@/lib/messages/queries";

type MatchChatPageProps = {
  params: Promise<{ matchId: string }>;
};

export default async function MatchChatPage({ params }: MatchChatPageProps) {
  const { matchId } = await params;
  const session = await getSession();
  if (!session) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/messages/${matchId}`)}`);
  }

  const meta = await getConversationMeta(matchId, session.user.id);
  if (!meta) {
    notFound();
  }

  const [messages, conversations] = await Promise.all([
    getMatchMessages(matchId, session.user.id),
    getConversationsForUser(session.user.id),
  ]);

  await markMatchMessagesRead(matchId, session.user.id);

  return (
    <Container className="py-6 pb-24 md:py-8 md:pb-12">
      <div className="hidden md:mb-6 md:block">
        <h1 className="text-display text-3xl">Messages</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-8 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <div className="hidden md:block">
          <MessagesInbox
            conversations={conversations}
            activeMatchId={matchId}
          />
        </div>

        <ChatRoom
          matchId={matchId}
          userId={session.user.id}
          otherUserId={meta.counterpartyId}
          meta={{
            title: meta.title,
            counterpartyName: meta.counterpartyName,
            counterpartyAvatarUrl: meta.counterpartyAvatarUrl,
          }}
          initialMessages={messages}
        />
      </div>
    </Container>
  );
}
