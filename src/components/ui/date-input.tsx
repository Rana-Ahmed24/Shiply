"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { localDateIso, minSelectableDateIso } from "@/lib/format/date";
import { cn } from "@/lib/utils";

type DateInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "min"
> & {
  /** Earliest selectable day (defaults to today). */
  minDate?: string;
  /** Also enforce today even when minDate is earlier (default true). */
  disallowPast?: boolean;
};

/**
 * Native date picker with past days disabled in the calendar dropdown.
 */
function DateInput({
  className,
  minDate,
  disallowPast = true,
  ...props
}: DateInputProps) {
  const min = disallowPast
    ? minSelectableDateIso(minDate)
    : minDate ?? localDateIso();

  return (
    <Input
      type="date"
      min={min}
      className={cn("h-11 rounded-2xl", className)}
      {...props}
    />
  );
}

export { DateInput };
