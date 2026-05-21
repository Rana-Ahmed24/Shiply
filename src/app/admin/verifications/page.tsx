import { Container } from "@/components/layout/container";
import { AdminVerificationQueue } from "@/components/verification/admin-verification-queue";
import { getAdminVerificationQueue } from "@/lib/verification/queries";

export default async function AdminVerificationsPage() {
  const items = await getAdminVerificationQueue();

  return (
    <Container className="max-w-4xl space-y-8 py-10 md:py-14">
      <div>
        <h1 className="text-display text-3xl">Traveler verifications</h1>
        <p className="mt-2 text-muted-foreground">
          Review passport, selfie, and flight documents. Approve or reject with
          a reason.
        </p>
      </div>
      <AdminVerificationQueue items={items} />
    </Container>
  );
}
