import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <Container className="space-y-8 py-8 pb-24 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-40 rounded-2xl" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-2xl" />
        <Skeleton className="h-9 w-24 rounded-2xl" />
      </div>
      <Skeleton className="h-10 w-52 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    </Container>
  );
}
