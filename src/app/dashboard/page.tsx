import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/server";
import { hasRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const { user, profile } = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/dashboard")}`
  );

  const roles = profile?.roles ?? [];

  return (
    <Container className="py-12">
      <div className="space-y-2">
        <h1 className="text-display text-3xl">
          Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">{user.email}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {roles.map((role) => (
            <Badge
              key={role}
              variant="outline"
              className="rounded-full capitalize"
            >
              {role}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {hasRole(roles, "customer") && (
          <Link
            href="/requests/new"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-auto flex-col items-start gap-2 rounded-2xl p-6"
            )}
          >
            <span className="font-semibold">Post a request</span>
            <span className="text-sm font-normal text-muted-foreground">
              Need something from abroad?
            </span>
          </Link>
        )}
        {hasRole(roles, "traveler") && (
          <Link
            href="/listings/new"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-auto flex-col items-start gap-2 rounded-2xl bg-brand-gold p-6 text-brand-navy hover:bg-brand-gold/90"
            )}
          >
            <span className="font-semibold">Create a listing</span>
            <span className="text-sm font-normal opacity-80">
              Share your upcoming trip
            </span>
          </Link>
        )}
      </div>
    </Container>
  );
}
