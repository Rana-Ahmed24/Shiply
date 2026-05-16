import Link from "next/link";

import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-baseline gap-1 font-semibold tracking-tight",
        className
      )}
    >
      <span className="text-foreground">{SITE.name}</span>
      <span className="text-brand-teal text-sm font-medium">{SITE.tagline}</span>
    </Link>
  );
}
