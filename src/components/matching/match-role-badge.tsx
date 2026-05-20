import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MatchRoleBadgeProps = {
  role: "customer" | "traveler";
  className?: string;
};

const STYLES = {
  customer:
    "border-brand-teal/35 bg-brand-teal/10 text-brand-teal dark:text-brand-teal",
  traveler:
    "border-brand-gold/35 bg-brand-gold/15 text-brand-navy dark:text-brand-gold",
} as const;

const LABELS = {
  customer: "You are the customer",
  traveler: "You are the traveler",
} as const;

export function MatchRoleBadge({ role, className }: MatchRoleBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full text-xs font-semibold", STYLES[role], className)}
    >
      {LABELS[role]}
    </Badge>
  );
}
