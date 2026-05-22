import { NotificationsList } from "@/components/notifications/notifications-list";
import { Container } from "@/components/layout/container";
import { requireSession } from "@/lib/auth/server";
import { getAllNotifications } from "@/lib/notifications/queries";

export default async function NotificationsPage() {
  const session = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/notifications")}`
  );

  const notifications = await getAllNotifications(session.user.id, 50);

  return (
    <Container className="py-8 pb-24 md:py-10 md:pb-12">
      <header className="mb-6">
        <h1 className="text-display text-3xl">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Matches, messages, payments, and account updates in one place.
        </p>
      </header>

      <NotificationsList initialNotifications={notifications} />
    </Container>
  );
}
