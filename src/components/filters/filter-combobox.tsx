"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type FilterComboboxProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function FilterCombobox({
  label,
  value,
  onChange,
  options,
  placeholder = "Type to search…",
  className,
  disabled,
}: FilterComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  useEffect(() => {
    setInput(selectedLabel);
  }, [selectedLabel]);

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
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function selectOption(optionValue: string, optionLabel: string) {
    onChange(optionValue);
    setInput(optionLabel);
    setOpen(false);
  }

  function clear() {
    onChange("");
    setInput("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label className="sr-only">{label}</label>
      <input
        type="text"
        value={input}
        disabled={disabled}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
          if (!e.target.value.trim()) onChange("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
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
      {open && filtered.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-border/80 bg-card py-1 shadow-soft"
        >
          <li>
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clear}
            >
              All
            </button>
          </li>
          {filtered.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === opt.value}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                  value === opt.value && "bg-brand-teal/10 text-foreground"
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
