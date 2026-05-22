"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { FieldError } from "@/components/auth/field-error";
import { ReviewStarInput } from "@/components/reviews/review-stars";
import { useActionStateToast } from "@/hooks/use-action-state-toast";
import { submitReviewAction } from "@/lib/reviews/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MatchReviewContext } from "@/types/review";

type ReviewFormProps = {
  context: MatchReviewContext;
};

function SubmitReviewButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
    >
      {pending ? "Submitting…" : "Submit review"}
    </Button>
  );
}

export function ReviewForm({ context }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [state, formAction] = useActionState(submitReviewAction, {});
  useActionStateToast(state, {
    successTitle: "Review submitted",
    errorTitle: "Could not submit review",
  });

  if (!context.matchCompleted) {
    return null;
  }

  if (context.alreadyReviewed && context.submittedReview) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <p className="font-medium text-emerald-800 dark:text-emerald-200">
          Review submitted
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          You rated {context.revieweeName ?? "your counterparty"}{" "}
          {context.submittedReview.rating} / 5
          {context.submittedReview.comment
            ? ` — “${context.submittedReview.comment}”`
            : ""}
        </p>
      </div>
    );
  }

  if (!context.canReview) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
      <h2 className="text-lg font-semibold">Rate your experience</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        You are reviewing{" "}
        <span className="font-medium text-foreground">
          {context.revieweeName ?? "your counterparty"}
        </span>{" "}
        as a {context.revieweeRole === "traveler" ? "Traveler" : "Customer"}.
      </p>

      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="matchId" value={context.matchId} />

        <div className="space-y-2">
          <Label>Your rating</Label>
          <ReviewStarInput
            name="rating"
            value={rating}
            onChange={setRating}
          />
          <FieldError messages={state.fieldErrors?.rating} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-comment">Written review (optional)</Label>
          <Textarea
            id="review-comment"
            name="comment"
            rows={4}
            maxLength={2000}
            placeholder="Share how the delivery went…"
            className="rounded-2xl resize-y"
          />
          <FieldError messages={state.fieldErrors?.comment} />
        </div>

        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}

        <SubmitReviewButton />
      </form>
    </section>
  );
}
