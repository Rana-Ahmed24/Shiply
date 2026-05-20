"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type ToggleChipGroupProps = {
  name: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  minSelected?: number;
  activeClassName?: string;
};

export function ToggleChipGroup({
  name,
  options,
  value,
  onChange,
  minSelected = 0,
  activeClassName,
}: ToggleChipGroupProps) {
  function toggle(option: string) {
    const isOn = value.includes(option);
    if (isOn) {
      if (value.length <= minSelected) return;
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <label
            key={option}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              selected
                ? cn(
                    "border-brand-gold/60 bg-brand-gold/20 text-foreground shadow-sm",
                    activeClassName
                  )
                : "border-border/70 bg-card text-muted-foreground hover:border-border hover:bg-card-hover hover:text-foreground"
            )}
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={selected}
              onChange={() => toggle(option)}
              className="sr-only"
            />
            {selected ? (
              <Check className="size-3.5 shrink-0 text-brand-gold" aria-hidden />
            ) : (
              <span className="size-3.5 shrink-0" aria-hidden />
            )}
            {option}
          </label>
        );
      })}
    </div>
  );
}
