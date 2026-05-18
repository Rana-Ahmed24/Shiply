import { Container } from "@/components/layout/container";
import { requireSession } from "@/lib/auth/server";

export default async function MessagesPage() {
  await requireSession(`/login?redirectTo=${encodeURIComponent("/messages")}`);

  return (
    <Container className="py-12 pb-24 md:pb-12">
      <h1 className="text-display text-3xl">Messages</h1>
      <p className="mt-2 text-muted-foreground">
        Messaging between customers and travelers is coming soon.
      </p>
    </Container>
  );
}
