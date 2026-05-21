"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useActionStateToast } from "@/hooks/use-action-state-toast";
import { VerificationDocUpload } from "@/components/verification/verification-doc-upload";
import { VerificationProgress } from "@/components/verification/verification-progress";
import { VerificationDetailsPanel } from "@/components/verification/verification-details-panel";
import { VerificationStatusBanner } from "@/components/verification/verification-status-banner";
import { submitTravelerVerificationAction } from "@/lib/verification/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TravelerVerificationView } from "@/types/traveler-verification";

const STEPS = [
  { id: 1, title: "Passport", kind: "passport" as const },
  { id: 2, title: "Selfie", kind: "selfie" as const },
  { id: 3, title: "Flight ticket", kind: "ticket" as const },
  { id: 4, title: "Review & submit", kind: null },
];

type TravelerVerificationWizardProps = {
  initial: TravelerVerificationView;
  backHref?: string;
};

function SubmitButton({ canSubmit }: { canSubmit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || !canSubmit}
      className="rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90 disabled:opacity-50"
    >
      {pending ? "Submitting…" : "Submit for review"}
    </Button>
  );
}

export function TravelerVerificationWizard({
  initial,
  backHref = "/listings/new",
}: TravelerVerificationWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitState, submitAction] = useActionState(
    submitTravelerVerificationAction,
    {}
  );
  useActionStateToast(submitState, {
    successTitle: "Submitted",
    errorTitle: "Could not submit",
  });

  useEffect(() => {
    if (submitState.success) router.refresh();
  }, [submitState.success, router]);

  const locked =
    initial.status === "pending" || initial.status === "verified";
  const canEdit = !locked;

  if (initial.status === "pending" || initial.status === "verified") {
    return (
      <div className="space-y-6">
        <VerificationStatusBanner
          verification={initial}
          showStatusLink={false}
        />
        <VerificationDetailsPanel verification={initial} />
        <Link
          href={backHref}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "inline-flex rounded-2xl"
          )}
        >
          Back to create listing
        </Link>
      </div>
    );
  }

  const current = STEPS[step - 1];
  const readyToSubmit =
    initial.hasPassport && initial.hasSelfie && initial.hasTicket;

  return (
    <div className="space-y-8">
      {initial.status === "rejected" ? (
        <VerificationStatusBanner verification={initial} />
      ) : null}

      <VerificationProgress
        hasPassport={initial.hasPassport}
        hasSelfie={initial.hasSelfie}
        hasTicket={initial.hasTicket}
      />

      <nav className="flex flex-wrap gap-2" aria-label="Verification steps">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={!canEdit && s.id !== 4}
            onClick={() => setStep(s.id)}
            className={
              step === s.id
                ? "rounded-full bg-brand-gold/20 px-3 py-1 text-sm font-medium text-brand-gold"
                : "rounded-full border border-border/80 px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
            }
          >
            {s.id}. {s.title}
          </button>
        ))}
      </nav>

      <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">{current.title}</h2>

        {current.kind === "passport" && (
          <div className="mt-4">
            <VerificationDocUpload
              kind="passport"
              label="Passport photo"
              hint="Clear photo of your passport ID page. JPEG, PNG, WebP, or PDF up to 5MB."
              uploaded={initial.hasPassport}
              disabled={!canEdit}
            />
          </div>
        )}

        {current.kind === "selfie" && (
          <div className="mt-4">
            <VerificationDocUpload
              kind="selfie"
              label="Selfie"
              hint="Hold your passport next to your face. Good lighting, no filters."
              uploaded={initial.hasSelfie}
              disabled={!canEdit}
            />
          </div>
        )}

        {current.kind === "ticket" && (
          <div className="mt-4">
            <VerificationDocUpload
              kind="ticket"
              label="Flight ticket or booking"
              hint="Proof of your upcoming trip into Egypt (confirmation or itinerary)."
              uploaded={initial.hasTicket}
              disabled={!canEdit}
            />
          </div>
        )}

        {current.kind === null && (
          <div className="mt-4 space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Passport: {initial.hasPassport ? "Uploaded ✓" : "Missing"}</li>
              <li>Selfie: {initial.hasSelfie ? "Uploaded ✓" : "Missing"}</li>
              <li>Ticket: {initial.hasTicket ? "Uploaded ✓" : "Missing"}</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              By submitting, you confirm these documents are accurate. Our team
              will review them within 1–2 business days.
            </p>
            <form action={submitAction}>
              <SubmitButton canSubmit={readyToSubmit} />
            </form>
          </div>
        )}

        <div className="mt-6 flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={step <= 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            Back
          </Button>
          {step < 4 ? (
            <Button
              type="button"
              className="rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
            >
              Continue
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
