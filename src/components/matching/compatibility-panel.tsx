"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CompatibilityResult } from "@/types/match";
import { cn } from "@/lib/utils";

type CompatibilityPanelProps = {
  result: CompatibilityResult | null;
  loading?: boolean;
  className?: string;
};

export function CompatibilityPanel({
  result,
  loading,
  className,
}: CompatibilityPanelProps) {
  if (loading) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Checking compatibility…
      </p>
    );
  }

  if (!result) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Select a listing and request to see compatibility.
      </p>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Match score</span>
        <Badge className="rounded-full bg-brand-teal/15 text-base font-semibold text-brand-teal">
          {result.score}/100
        </Badge>
        <span className="text-xs text-muted-foreground">
          Higher is better — you can still request a match at any score.
        </span>
      </div>

      <ul className="space-y-2">
        {result.factors.map((factor) => (
          <li
            key={factor.key}
            className="flex gap-2 rounded-xl border border-border/50 px-3 py-2 text-sm"
          >
            {factor.passed ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-teal" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0">
              <p className="font-medium">
                {factor.label}{" "}
                <span className="text-muted-foreground">
                  ({factor.score}/{factor.maxScore})
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{factor.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
