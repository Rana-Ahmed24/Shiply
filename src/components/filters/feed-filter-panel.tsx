import { cn } from "@/lib/utils";

type FeedFilterPanelProps = {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
};

export function FeedFilterPanel({
  children,
  className,
  actions,
}: FeedFilterPanelProps) {
  return (
    <div className={cn("feed-filter-panel", className)}>
      {children}
      {actions ? (
        <div className="feed-filter-actions">{actions}</div>
      ) : null}
    </div>
  );
}

export function FeedFilterGrid({
  children,
  className,
  cols = 3,
}: {
  children: React.ReactNode;
  className?: string;
  cols?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        cols === 2 ? "feed-filter-grid-2" : "feed-filter-grid-3",
        className
      )}
    >
      {children}
    </div>
  );
}
