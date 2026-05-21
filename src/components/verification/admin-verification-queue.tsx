"use client";

import { useActionState, useEffect, useState, useTransition } from "react";

import { useActionStateToast } from "@/hooks/use-action-state-toast";
import { useToast } from "@/components/ui/toast-provider";
import { TravelerVerificationBadge } from "@/components/verification/traveler-verification-badge";
import {
  approveVerificationAction,
  getVerificationSignedUrlAction,
  rejectVerificationAction,
} from "@/lib/verification/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminVerificationQueueItem } from "@/types/traveler-verification";

type AdminVerificationQueueProps = {
  items: AdminVerificationQueueItem[];
};

function DocPreview({
  label,
  path,
}: {
  label: string;
  path: string | null;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    getVerificationSignedUrlAction(path).then((res) => {
      if (!cancelled) setUrl(res.url);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!path) {
    return (
      <p className="text-xs text-muted-foreground">{label}: not uploaded</p>
    );
  }

  if (!url) {
    return (
      <p className="text-xs text-muted-foreground">{label}: loading preview…</p>
    );
  }

  const isPdf = path.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {isPdf ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand-teal hover:underline"
        >
          Open PDF
        </a>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="max-h-40 rounded-lg border border-border/80 object-contain"
          />
        </a>
      )}
    </div>
  );
}

function RejectForm({ item }: { item: AdminVerificationQueueItem }) {
  const [state, action] = useActionState(rejectVerificationAction, {});
  useActionStateToast(state);

  if (item.status !== "pending") return null;

  return (
    <form action={action} className="mt-3 space-y-2">
      <input type="hidden" name="verificationId" value={item.id} />
      <Label htmlFor={`reason-${item.id}`}>Rejection reason (required)</Label>
      <Input
        id={`reason-${item.id}`}
        name="reason"
        required
        placeholder="e.g. Passport image is blurry"
        className="rounded-2xl"
      />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        className="rounded-xl"
      >
        Reject
      </Button>
    </form>
  );
}

function ApproveButton({ verificationId }: { verificationId: string }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      const result = await approveVerificationAction(verificationId);
      if (result.error) {
        toast({
          variant: "error",
          title: "Could not approve",
          description: result.error,
        });
      } else {
        toast({
          variant: "success",
          title: "Approved",
          description: result.success,
        });
        window.location.reload();
      }
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-600/90"
      onClick={approve}
    >
      {pending ? "Approving…" : "Approve"}
    </Button>
  );
}

export function AdminVerificationQueue({ items }: AdminVerificationQueueProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
        No verification submissions yet.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{item.fullName ?? "Traveler"}</p>
              <p className="text-sm text-muted-foreground">{item.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Submitted{" "}
                {new Date(item.createdAt).toLocaleDateString("en-GB", {
                  dateStyle: "medium",
                })}
              </p>
            </div>
            <TravelerVerificationBadge status={item.status} showNonVerified />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <DocPreview label="Passport" path={item.passportPath} />
            <DocPreview label="Selfie" path={item.selfiePath} />
            <DocPreview label="Ticket" path={item.ticketPath} />
          </div>

          {item.status === "pending" ? (
            <div className="mt-4 flex flex-wrap items-start gap-4">
              <ApproveButton verificationId={item.id} />
              <RejectForm item={item} />
            </div>
          ) : null}

          {item.status === "rejected" && item.rejectionReason ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              Rejected: {item.rejectionReason}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
