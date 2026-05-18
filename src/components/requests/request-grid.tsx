import { RequestCard } from "@/components/requests/request-card";
import type { RequestCardModel } from "@/types/request";
import { cn } from "@/lib/utils";

type RequestGridProps = {
  requests: RequestCardModel[];
  className?: string;
  emptyMessage?: string;
};

export function RequestGrid({
  requests,
  className,
  emptyMessage = "No requests yet. Post what you need from abroad and travelers can help.",
}: RequestGridProps) {
  if (requests.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/60 py-16 text-center text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
