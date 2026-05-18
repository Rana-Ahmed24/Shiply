import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ListingCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-5 shadow-soft",
        className
      )}
    >
      <div className="flex justify-between gap-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3 w-1/3" />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
