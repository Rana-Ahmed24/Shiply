import { MessagesInbox } from "@/components/messages/messages-inbox";
import { Container } from "@/components/layout/container";
import { requireSession } from "@/lib/auth/server";
import { getConversationsForUser } from "@/lib/messages/queries";

export default async function MessagesPage() {
  const session = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/messages")}`
  );

  const conversations = await getConversationsForUser(session.user.id);

  return (
    <Container className="py-8 pb-24 md:py-10 md:pb-12">
      <header className="mb-6">
        <h1 className="text-display text-3xl">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chat with your delivery partners on accepted matches.
        </p>
      </header>

      <MessagesInbox conversations={conversations} />
    </Container>
  );
}
