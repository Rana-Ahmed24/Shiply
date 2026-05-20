import { ChevronDown } from "lucide-react";

import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type FilterSelectProps = React.ComponentProps<"select"> & {
  wrapperClassName?: string;
};

export function FilterSelect({
  className,
  wrapperClassName,
  children,
  ...props
}: FilterSelectProps) {
  return (
    <div className={cn("feed-filter-select-wrap", wrapperClassName)}>
      <Select className={cn("feed-filter-field", className)} {...props}>
        {children}
      </Select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
