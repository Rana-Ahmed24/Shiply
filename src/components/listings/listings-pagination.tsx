"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ListingsPaginationProps = {
  page: number;
  totalPages: number;
  basePath?: string;
};

export function ListingsPagination({
  page,
  totalPages,
  basePath = "/travelers",
}: ListingsPaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav
      className="flex items-center justify-center gap-2 pt-8"
      aria-label="Listings pagination"
    >
      <Link
        href={hrefFor(page - 1)}
        aria-disabled={page <= 1}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-2xl",
          page <= 1 && "pointer-events-none opacity-50"
        )}
      >
        Previous
      </Link>
      <span className="px-3 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Link
        href={hrefFor(page + 1)}
        aria-disabled={page >= totalPages}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-2xl",
          page >= totalPages && "pointer-events-none opacity-50"
        )}
      >
        Next
      </Link>
    </nav>
  );
}
