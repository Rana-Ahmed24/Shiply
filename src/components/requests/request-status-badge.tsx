import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RequestLifecycle } from "@/types/request";

const STYLES: Record<RequestLifecycle, string> = {
  pending: "bg-muted text-muted-foreground",
  accepted: "bg-brand-teal/15 text-brand-teal",
  purchased: "bg-brand-gold/15 text-brand-gold",
  shipped: "bg-blue-500/15 text-blue-400",
  delivered: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive",
};

type RequestStatusBadgeProps = {
  lifecycle: RequestLifecycle;
  label: string;
  className?: string;
};

export function RequestStatusBadge({
  lifecycle,
  label,
  className,
}: RequestStatusBadgeProps) {
  return (
    <Badge
      className={cn("rounded-full border-0 capitalize", STYLES[lifecycle], className)}
    >
      {label}
    </Badge>
  );
}
