"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type FilterComboboxProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  /** Shown when nothing is selected */
  emptyLabel?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function FilterCombobox({
  label,
  value,
  onChange,
  options,
  emptyLabel = "All",
  placeholder,
  className,
  disabled,
}: FilterComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  useEffect(() => {
    if (!focused) {
      setInput(value ? selectedLabel : "");
    }
  }, [value, selectedLabel, focused]);

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [...options];
    return options.filter(
      (o) =>
        o.label.toLowerCase().startsWith(q) ||
        o.value.toLowerCase().startsWith(q)
    );
  }, [input, options]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function selectOption(optionValue: string, optionLabel: string) {
    onChange(optionValue);
    setInput(optionLabel);
    setOpen(false);
    setFocused(false);
  }

  function clear() {
    onChange("");
    setInput("");
    setOpen(false);
  }

  const showPlaceholder = !value && !focused && !input;

  return (
    <div ref={rootRef} className={cn("feed-filter-select-wrap", className)}>
      <label className="sr-only">{label}</label>
      <input
        type="text"
        value={input}
        disabled={disabled}
        placeholder={showPlaceholder ? (placeholder ?? emptyLabel) : placeholder}
        className="feed-filter-field pr-10"
        onFocus={() => {
          setFocused(true);
          setOpen(true);
          if (!value) setInput("");
        }}
        onBlur={() => {
          setFocused(false);
        }}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
          if (!e.target.value.trim()) onChange("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setFocused(false);
          }
          if (e.key === "Enter" && filtered[0]) {
            e.preventDefault();
            selectOption(filtered[0].value, filtered[0].label);
          }
        }}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
      />
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      {open && filtered.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-52 w-full overflow-auto rounded-2xl border border-border/80 bg-card py-1 shadow-soft-lg"
        >
          <li>
            <button
              type="button"
              className="w-full px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clear}
            >
              {emptyLabel}
            </button>
          </li>
          {filtered.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === opt.value}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm hover:bg-muted",
                  value === opt.value && "bg-brand-gold/10 text-foreground"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectOption(opt.value, opt.label)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
