import Link from "next/link";
import { Package, Plane } from "lucide-react";

import { HeroListingsPanel } from "@/components/home/hero-listings-panel";
import { buttonVariants } from "@/components/ui/button";
import type { ListingCardModel } from "@/types/listing";
import { cn } from "@/lib/utils";

const STATS = [
  { value: "2,400+", label: "Deals completed" },
  { value: "4.9★", label: "Avg. traveler rating" },
  { value: "0%", label: "Unresolved disputes" },
] as const;

type HomeHeroDashboardProps = {
  featuredListings: ListingCardModel[];
};

export function HomeHeroDashboard({ featuredListings }: HomeHeroDashboardProps) {
  return (
    <section className="py-10 md:py-14 lg:py-16">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-6 lg:space-y-8">
          <div className="shiply-eyebrow">
            <span className="size-1.5 animate-pulse rounded-full bg-brand-gold" aria-hidden />
            Trusted by 2,400+ Egyptians
          </div>
          <h1 className="text-display mb-0 max-w-xl">
            Bring Anything
            <br />
            From Abroad —
            <br />
            <span className="text-brand-gold">Safely.</span>
          </h1>
          <p className="text-lead max-w-md">
            Connect with verified travelers coming to Egypt and get products
            delivered with full deposit protection.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/requests/new"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gold px-7 py-3.5 text-base font-medium text-brand-navy hover:bg-brand-gold-light"
              )}
            >
              <Package className="size-4" aria-hidden />
              I need something
            </Link>
            <Link
              href="/listings/new"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "inline-flex items-center justify-center gap-2 rounded-xl border-border/80 bg-muted px-7 py-3.5 text-base hover:border-border hover:bg-card-hover"
              )}
            >
              <Plane className="size-4" aria-hidden />
              I&apos;m traveling
            </Link>
          </div>
          <dl className="flex flex-wrap gap-8 pt-2">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-xl font-bold">{stat.value}</dd>
                <dt className="mt-0.5 text-xs text-brand-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:pt-2">
          <HeroListingsPanel listings={featuredListings} />
        </div>
      </div>
    </section>
  );
}
