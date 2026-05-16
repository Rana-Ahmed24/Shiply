import { Container } from "@/components/layout/container";
import { requireSession } from "@/lib/auth/server";

export default async function DashboardPage() {
  const { user, profile } = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/dashboard")}`
  );

  return (
    <Container className="py-12">
      <h1 className="text-display text-3xl">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Signed in as {profile?.full_name ?? user.email}
      </p>
    </Container>
  );
}
