import { cn } from "@/lib/utils";

type ListingTripDatesProps = {
  departs: string | null;
  arrives: string;
  className?: string;
  compact?: boolean;
};

function DateCell({
  label,
  value,
  compact,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("text-center", compact ? "" : "")}>
      <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-medium text-foreground",
          compact ? "text-xs" : "text-sm"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ListingTripDates({
  departs,
  arrives,
  className,
  compact = false,
}: ListingTripDatesProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3",
        className
      )}
    >
      <DateCell
        label="Departs"
        value={departs ?? "—"}
        compact={compact}
      />
      <DateCell label="Arrives" value={arrives} compact={compact} />
    </div>
  );
}
