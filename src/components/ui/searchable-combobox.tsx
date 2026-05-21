"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string;
};

type SearchableComboboxProps = {
  id?: string;
  name: string;
  options: ComboboxOption[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  /** Allow typing a city/value not in the options list (min 2 characters). */
  allowCustomValue?: boolean;
  className?: string;
};

export function SearchableCombobox({
  id,
  name,
  options,
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No matches found.",
  required,
  disabled,
  allowCustomValue = false,
  className,
}: SearchableComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = isControlled ? controlledValue : internalValue;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find((o) => o.value === selectedValue);
  const displayLabel =
    selectedOption?.label ??
    (selectedValue ? selectedValue : undefined);

  const customQuery = query.trim();
  const showCustomOption =
    allowCustomValue &&
    customQuery.length >= 2 &&
    !options.some(
      (o) => o.value.toLowerCase() === customQuery.toLowerCase()
    );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const labelText = o.label
        .replace(/^[\u{1F1E6}-\u{1F1FF}]{2}\s*/u, "")
        .trim()
        .toLowerCase();
      return labelText.startsWith(q) || o.value.toLowerCase().startsWith(q);
    });
  }, [options, query]);

  const notifyFormChange = useCallback(() => {
    const input = hiddenRef.current;
    if (!input) return;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, []);

  function select(next: string) {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
    setOpen(false);
    setQuery("");
    queueMicrotask(notifyFormChange);
  }

  useEffect(() => {
    if (selectedValue) {
      queueMicrotask(notifyFormChange);
    }
  }, [selectedValue, notifyFormChange]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        value={selectedValue}
        required={required}
      />

      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-2xl border border-input bg-card px-3 py-2 text-left text-sm text-foreground transition-colors",
          "hover:border-ring/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
          !displayLabel && "text-muted-foreground"
        )}
      >
        <span className="truncate">{displayLabel ?? placeholder}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div
          className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-soft-lg"
          role="presentation"
        >
          <div className="border-b border-border/60 p-2">
            <Input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 rounded-lg bg-background text-foreground"
              autoComplete="off"
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            className="max-h-56 overflow-y-auto p-1"
          >
            {showCustomOption ? (
              <li role="option" aria-selected={selectedValue === customQuery}>
                <button
                  type="button"
                  onClick={() => select(customQuery)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground hover:bg-muted"
                >
                  <span className="flex-1 truncate">
                    Use &ldquo;{customQuery}&rdquo;
                  </span>
                </button>
              </li>
            ) : null}
            {filtered.length === 0 && !showCustomOption ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </li>
            ) : (
              filtered.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => select(option.value)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-brand-gold/15 text-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected ? (
                        <Check className="size-4 shrink-0 text-brand-gold" />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
