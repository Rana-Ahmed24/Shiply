import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { RequestDangerZone } from "@/components/requests/request-danger-zone";
import { RequestForm } from "@/components/requests/request-form";
import { buttonVariants } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/server";
import { EDITABLE_LIFECYCLE } from "@/lib/requests/constants";
import { getRequestById } from "@/lib/requests/queries";
import { cn } from "@/lib/utils";

type EditRequestPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRequestPage({ params }: EditRequestPageProps) {
  const { id } = await params;
  const { user } = await requireSession(
    `/login?redirectTo=${encodeURIComponent(`/requests/${id}/edit`)}`
  );

  const request = await getRequestById(id, user.id);
  if (!request) {
    notFound();
  }

  if (request.customerId !== user.id) {
    redirect("/requests?error=edit_denied");
  }

  if (!EDITABLE_LIFECYCLE.includes(request.lifecycle)) {
    redirect(`/requests/${id}?error=cannot_edit`);
  }

  return (
    <Container className="max-w-3xl space-y-8 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">Edit request</h1>
          <p className="mt-1 text-muted-foreground">{request.title}</p>
        </div>
        <Link
          href={`/requests/${id}`}
          className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
        >
          View request
        </Link>
      </div>

      <RequestForm request={request} />

      <div className="border-t border-border/60 pt-8">
        <RequestDangerZone
          requestId={id}
          canCancel={
            request.lifecycle !== "cancelled" &&
            request.lifecycle !== "delivered"
          }
        />
      </div>
    </Container>
  );
}
