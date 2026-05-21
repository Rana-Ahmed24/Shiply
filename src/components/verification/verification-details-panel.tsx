"use client";

import { Check, X } from "lucide-react";

import { formatShortDateUtc } from "@/lib/format/date";
import type { TravelerVerificationView } from "@/types/traveler-verification";
import { cn } from "@/lib/utils";

type VerificationDetailsPanelProps = {
  verification: TravelerVerificationView;
  className?: string;
};

function DocRow({ label, uploaded }: { label: string; uploaded: boolean }) {
  return (
    <li className="rounded-xl border border-border/60 bg-card/50 px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm">
        {uploaded ? (
          <Check className="size-4 shrink-0 text-brand-teal" aria-hidden />
        ) : (
          <X className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <span className={uploaded ? "text-foreground" : "text-muted-foreground"}>
          {label}: {uploaded ? "Uploaded" : "Not uploaded"}
        </span>
      </div>
    </li>
  );
}

export function VerificationDetailsPanel({
  verification,
  className,
}: VerificationDetailsPanelProps) {
  const { status, createdAt, reviewedAt, hasPassport, hasSelfie, hasTicket } =
    verification;

  if (status === "not_submitted") return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-muted/20 p-5",
        className
      )}
      aria-labelledby="verification-details-heading"
    >
      <h2
        id="verification-details-heading"
        className="text-lg font-semibold text-foreground"
      >
        Verification details
      </h2>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        {createdAt ? (
          <div>
            <dt className="text-muted-foreground">Submitted</dt>
            <dd className="font-medium text-foreground">
              {formatShortDateUtc(createdAt)}
            </dd>
          </div>
        ) : null}
        {status === "verified" && reviewedAt ? (
          <div>
            <dt className="text-muted-foreground">Approved</dt>
            <dd className="font-medium text-foreground">
              {formatShortDateUtc(reviewedAt)}
            </dd>
          </div>
        ) : null}
        {status === "pending" ? (
          <div>
            <dt className="text-muted-foreground">Review status</dt>
            <dd className="font-medium text-foreground">In progress</dd>
          </div>
        ) : null}
        {status === "invalid" ? (
          <div>
            <dt className="text-muted-foreground">Review status</dt>
            <dd className="font-medium text-amber-700 dark:text-amber-300">
              Incomplete — re-upload required
            </dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-4 text-sm font-medium text-foreground">Documents</p>
      <ul className="mt-2 space-y-2">
        <DocRow label="Passport" uploaded={hasPassport} />
        <DocRow label="Selfie" uploaded={hasSelfie} />
        <DocRow label="Flight ticket" uploaded={hasTicket} />
      </ul>

      {status === "pending" ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Your application is under review. Use <span className="font-medium text-foreground">Edit</span> below to
          withdraw review and replace documents, then submit again.
        </p>
      ) : null}

      {status === "verified" ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Use <span className="font-medium text-foreground">Edit</span> below if you need to
          replace your verification documents.
        </p>
      ) : null}
    </section>
  );
}
