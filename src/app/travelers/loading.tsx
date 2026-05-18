import { Container } from "@/components/layout/container";
import { ListingGridSkeleton } from "@/components/listings/listing-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function TravelersLoading() {
  return (
    <Container className="space-y-8 py-10 md:py-14">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <Skeleton className="h-48 w-full" />
      <ListingGridSkeleton count={6} />
    </Container>
  );
}
