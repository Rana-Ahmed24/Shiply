import { Container } from "@/components/layout/container";
import { RequestGridSkeleton } from "@/components/requests/request-card-skeleton";

export default function RequestsLoading() {
  return (
    <Container className="space-y-8 py-10 md:py-14">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
      <RequestGridSkeleton count={6} />
    </Container>
  );
}
