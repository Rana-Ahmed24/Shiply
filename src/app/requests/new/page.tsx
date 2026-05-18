import Link from "next/link";

import { Container } from "@/components/layout/container";
import { RequestForm } from "@/components/requests/request-form";
import { buttonVariants } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

export default async function NewRequestPage() {
  await requireSession(
    `/login?redirectTo=${encodeURIComponent("/requests/new")}`
  );

  return (
    <Container className="max-w-3xl space-y-8 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">Post a request</h1>
          <p className="mt-1 text-muted-foreground">
            Tell travelers what you need — add photos, a link, and your budget.
          </p>
        </div>
        <Link
          href="/requests"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
        >
          My requests
        </Link>
      </div>
      <RequestForm />
    </Container>
  );
}
