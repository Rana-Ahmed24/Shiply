"use client";

import Link from "next/link";
import { Package, Plane } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useAppMode } from "@/lib/mode/client-store";
import type { AppMode } from "@/lib/mode/constants";
import { cn } from "@/lib/utils";

const MODE_COPY: Record<
  AppMode,
  { subtitle: string }
> = {
  customer: {
    subtitle: "Find trusted travelers and send packages safely.",
  },
  traveler: {
    subtitle: "Browse delivery requests and earn from your trips.",
  },
};

type HomeDashboardHeaderProps = {
  mode: AppMode;
};

export function HomeDashboardHeader({ mode: serverMode }: HomeDashboardHeaderProps) {
  const mode = useAppMode(serverMode);
  const copy = MODE_COPY[mode];

  return (
    <header className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-teal">
          Dashboard
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
          Home
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/requests/new"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 rounded-xl border-border/60 bg-card/50 px-4"
          )}
        >
          <Package className="mr-2 size-3.5" aria-hidden />
          Create request
        </Link>
        <Link
          href="/listings/new"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 rounded-xl border-border/60 bg-card/50 px-4"
          )}
        >
          <Plane className="mr-2 size-3.5" aria-hidden />
          List a trip
        </Link>
      </div>
    </header>
  );
}
