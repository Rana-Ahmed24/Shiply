import Link from "next/link";

import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Set false when Logo is placed inside another link */
  linked?: boolean;
  /** Defaults to `/` (marketing). Use `/home` for signed-in app home. */
  href?: string;
};

export function Logo({ className, linked = true, href = "/" }: LogoProps) {
  const content = (
    <>
      <span className="text-foreground">{SITE.name}</span>
      <span className="text-brand-teal text-sm font-medium">{SITE.tagline}</span>
    </>
  );

  const styles = cn(
    "inline-flex items-baseline gap-1 font-semibold tracking-tight",
    className
  );

  if (!linked) {
    return <span className={styles}>{content}</span>;
  }

  return (
    <Link href={href} className={styles}>
      {content}
    </Link>
  );
}
