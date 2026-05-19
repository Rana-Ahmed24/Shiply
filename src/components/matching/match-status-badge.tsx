import { Badge } from "@/components/ui/badge";
import type { MatchDisplayStatus } from "@/types/match";
import { cn } from "@/lib/utils";

const VARIANTS: Record<
  MatchDisplayStatus,
  string
> = {
  requested: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  accepted: "bg-brand-teal/10 text-brand-teal",
  rejected: "bg-muted text-muted-foreground",
  completed: "bg-brand-gold/15 text-brand-gold",
};

type MatchStatusBadgeProps = {
  label: string;
  status: MatchDisplayStatus;
  className?: string;
};

export function MatchStatusBadge({
  label,
  status,
  className,
}: MatchStatusBadgeProps) {
  return (
    <Badge className={cn("rounded-full capitalize", VARIANTS[status], className)}>
      {label}
    </Badge>
  );
}
