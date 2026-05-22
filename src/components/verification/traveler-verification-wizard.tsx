"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { useActionStateToast } from "@/hooks/use-action-state-toast";
import { VerificationDocUpload } from "@/components/verification/verification-doc-upload";
import { VerificationDetailsPanel } from "@/components/verification/verification-details-panel";
import { ResetVerificationButton } from "@/components/verification/reset-verification-button";
import { VerificationStatusBanner } from "@/components/verification/verification-status-banner";
import { VerificationStepNav } from "@/components/verification/verification-step-nav";
import { VerificationWizardFooter } from "@/components/verification/verification-wizard-footer";
import { submitTravelerVerificationAction } from "@/lib/verification/actions";
import { Button } from "@/components/ui/button";
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
    if (!submitState.success) return;
    router.replace(backHref, { scroll: false });
  }, [submitState.success, router, backHref]);

  const locked =
    initial.status === "pending" || initial.status === "verified";
  const showDetailsPanel = initial.status !== "not_submitted";

  if (locked) {
    return (
      <div className="space-y-6">
        <VerificationStatusBanner
          verification={initial}
          showStatusLink={false}
        />
        {showDetailsPanel ? (
          <VerificationDetailsPanel verification={initial} />
        ) : null}
        <VerificationWizardFooter backHref={backHref} showEdit />
      </div>
    );
  }

  const current = STEPS[step - 1];
  const readyToSubmit =
    initial.hasPassport && initial.hasSelfie && initial.hasTicket;

  return (
    <div className="space-y-8">
      {initial.status === "rejected" || initial.status === "invalid" ? (
        <VerificationStatusBanner verification={initial} />
      ) : null}

      {showDetailsPanel ? (
        <VerificationDetailsPanel verification={initial} />
      ) : null}

      {(initial.status === "invalid" || initial.status === "rejected") && (
        <ResetVerificationButton />
      )}

      <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
        <VerificationStepNav
          activeStep={step}
          onStepChange={setStep}
          hasPassport={initial.hasPassport}
          hasSelfie={initial.hasSelfie}
          hasTicket={initial.hasTicket}
          className="mb-6"
        />

        <h2 className="text-lg font-semibold">{current.title}</h2>

        {current.kind === "passport" && (
          <div className="mt-4">
            <VerificationDocUpload
              kind="passport"
              label="Passport photo"
              hint="Clear photo of your passport ID page. JPEG, PNG, WebP, or PDF up to 5MB."
              uploaded={initial.hasPassport}
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

      <VerificationWizardFooter backHref={backHref} />
    </div>
  );
}
