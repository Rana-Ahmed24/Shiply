"use client";

import Link from "next/link";
import { MessageSquare, Package, Plane } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useAppMode } from "@/lib/mode/client-store";
import type { AppMode } from "@/lib/mode/constants";
import { cn } from "@/lib/utils";

const MODE_COPY: Record<AppMode, { subtitle: string }> = {
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
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">
          Dashboard
        </p>
        <h1 className="text-display mb-0 text-3xl sm:text-4xl">Home</h1>
        <p className="max-w-xl text-base font-medium text-muted-foreground">
          {copy.subtitle}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/messages"
          className={cn(
            buttonVariants({ size: "sm" }),
            "h-9 rounded-xl bg-brand-gold px-4 text-brand-navy hover:bg-brand-gold/90"
          )}
        >
          <MessageSquare className="mr-2 size-3.5" aria-hidden />
          Messages
        </Link>
        <Link
          href="/requests/new"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 rounded-xl border-border/60 bg-card px-4"
          )}
        >
          <Package className="mr-2 size-3.5" aria-hidden />
          Create request
        </Link>
        <Link
          href="/listings/new"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 rounded-xl border-border/60 bg-card px-4"
          )}
        >
          <Plane className="mr-2 size-3.5" aria-hidden />
          List a trip
        </Link>
      </div>
    </header>
  );
}
