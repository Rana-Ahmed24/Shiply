import { Container } from "@/components/layout/container";
import { AdminReviewsQueue } from "@/components/reviews/admin-reviews-queue";
import { getAdminReviewQueue } from "@/lib/reviews/queries";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const items = await getAdminReviewQueue();

  return (
    <Container className="max-w-4xl space-y-8 py-10 md:py-14">
      <div>
        <h1 className="text-display text-3xl">Review moderation</h1>
        <p className="mt-2 text-muted-foreground">
          Hide, flag, or remove reviews. Only public, non-flagged reviews count
          toward rating averages.
        </p>
      </div>
      <AdminReviewsQueue items={items} />
    </Container>
  );
}
