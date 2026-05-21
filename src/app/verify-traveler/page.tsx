import Link from "next/link";

import { Container } from "@/components/layout/container";
import { TravelerVerificationWizard } from "@/components/verification/traveler-verification-wizard";
import { buttonVariants } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/server";
import { getTravelerVerification } from "@/lib/verification/queries";
import { cn } from "@/lib/utils";

export default async function VerifyTravelerPage() {
  const { user } = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/verify-traveler")}`
  );

  const verification = await getTravelerVerification(user.id);
  const backHref = "/listings/new";

  return (
    <Container className="max-w-2xl space-y-8 py-10 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">Traveler verification</h1>
          <p className="mt-2 text-muted-foreground">
            Upload your documents to become a verified traveler. This is optional
            during signup — verify when you are ready to list trips.
          </p>
        </div>
       
      </div>
      <TravelerVerificationWizard initial={verification} backHref={backHref} />
    </Container>
  );
}
