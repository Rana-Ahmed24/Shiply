import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RequestGrid } from "@/components/requests/request-grid";
import { buttonVariants } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/server";
import { getCustomerRequests } from "@/lib/requests/queries";
import { cn } from "@/lib/utils";

type RequestsPageProps = {
  searchParams: Promise<{ message?: string; error?: string; reason?: string }>;
};

export default async function RequestsDashboardPage({
  searchParams,
}: RequestsPageProps) {
  const params = await searchParams;
  const { user } = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/requests")}`
  );

  const requests = await getCustomerRequests(user.id);

  return (
    <Container className="space-y-8 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">My requests</h1>
          <p className="mt-1 text-muted-foreground">
            Track status, edit details, or post something new from abroad.
          </p>
        </div>
        <Link
          href="/requests/new"
          className={cn(
            buttonVariants(),
            "rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
          )}
        >
          New request
        </Link>
      </div>

      {params.message === "cancelled" && (
        <p className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Request cancelled.
        </p>
      )}
      {params.message === "deleted" && (
        <p className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Request deleted.
        </p>
      )}
      {params.error === "delete_policy" && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Delete was blocked by database security. Run{" "}
          <strong>fix-customer-request-delete-policy.sql</strong> in the
          Supabase SQL Editor, then try again.
        </p>
      )}
      {params.error === "delete_denied" && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          You can only delete your own requests.
        </p>
      )}
      {params.error && params.error !== "delete_policy" && params.error !== "delete_denied" && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Something went wrong. Please try again.
        </p>
      )}

      <RequestGrid requests={requests} />
    </Container>
  );
}
