"use client";

import { cn } from "@/lib/utils";

type TypingIndicatorProps = {
  name: string | null;
  className?: string;
};

export function TypingIndicator({ name, className }: TypingIndicatorProps) {
  return (
    <p
      className={cn(
        "px-4 py-1 text-xs text-muted-foreground animate-in fade-in duration-200",
        className
      )}
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-1">
        {name ?? "They"} is typing
        <span className="inline-flex gap-0.5">
          <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
          <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
          <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
        </span>
      </span>
    </p>
  );
}
