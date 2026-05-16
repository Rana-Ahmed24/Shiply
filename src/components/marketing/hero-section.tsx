"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { LiveListings } from "@/components/marketing/live-listings";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATS = [
  { value: "2,400+", label: "Deals completed" },
  { value: "4.9★", label: "Avg. traveler rating" },
  { value: "0%", label: "Unresolved disputes" },
] as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--brand-teal)_0%,transparent_50%)] opacity-[0.07]"
        aria-hidden
      />
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/10 px-4 py-1.5 text-sm text-brand-gold">
              <span className="size-1.5 rounded-full bg-brand-gold" aria-hidden />
              Trusted by 2,400+ Egyptians
            </div>

            <div className="space-y-4">
              <h1 className="text-display max-w-xl">
                Bring Anything From Abroad —{" "}
                <span className="text-brand-gold">Safely.</span>
              </h1>
              <p className="text-lead max-w-lg">
                Connect with verified travelers coming to Egypt and get products
                delivered with full deposit protection.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/requests"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-2xl bg-brand-gold px-8 text-brand-navy hover:bg-brand-gold/90"
                )}
              >
                I need something
              </Link>
              <Link
                href="/travelers"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-2xl border-border/80 px-8"
                )}
              >
                I&apos;m traveling
              </Link>
            </div>

            <dl className="grid grid-cols-3 gap-4 border-t border-border/60 pt-8 sm:gap-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {stat.value}
                  </dd>
                  <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:pt-4"
          >
            <LiveListings />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
