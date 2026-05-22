"use client";

import { useActionState } from "react";

import { ReviewCard } from "@/components/reviews/review-card";
import { useActionStateToast } from "@/hooks/use-action-state-toast";
import { moderateReviewAction } from "@/lib/reviews/actions";
import { Button } from "@/components/ui/button";
import type { AdminReviewRow } from "@/types/review";
import type { ReviewDisplay } from "@/types/review";

type AdminReviewsQueueProps = {
  items: AdminReviewRow[];
};

function toDisplay(row: AdminReviewRow): ReviewDisplay {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt,
    reviewerId: row.reviewerId,
    reviewerName: row.reviewerName,
    revieweeId: row.revieweeId,
    revieweeName: row.revieweeName,
    reviewerRole: row.reviewerRole,
    revieweeRole: row.revieweeRole,
  };
}

function ModerationBar({ item }: { item: AdminReviewRow }) {
  const [state, action] = useActionState(moderateReviewAction, {});
  useActionStateToast(state);

  const hidden = !item.isPublic || item.removedAt != null;
  const flagged = item.isFlagged;

  return (
    <form action={action} className="mt-3 flex flex-wrap gap-2">
      <input type="hidden" name="reviewId" value={item.id} />
      {hidden ? (
        <Button
          type="submit"
          name="action"
          value="show"
          size="sm"
          variant="outline"
          className="rounded-xl"
        >
          Show
        </Button>
      ) : (
        <Button
          type="submit"
          name="action"
          value="hide"
          size="sm"
          variant="outline"
          className="rounded-xl"
        >
          Hide
        </Button>
      )}
      {flagged ? (
        <Button
          type="submit"
          name="action"
          value="unflag"
          size="sm"
          variant="outline"
          className="rounded-xl"
        >
          Unflag
        </Button>
      ) : (
        <Button
          type="submit"
          name="action"
          value="flag"
          size="sm"
          variant="outline"
          className="rounded-xl"
        >
          Flag
        </Button>
      )}
      {item.removedAt ? (
        <Button
          type="submit"
          name="action"
          value="restore"
          size="sm"
          className="rounded-xl"
        >
          Restore
        </Button>
      ) : (
        <Button
          type="submit"
          name="action"
          value="remove"
          size="sm"
          variant="destructive"
          className="rounded-xl"
        >
          Remove
        </Button>
      )}
    </form>
  );
}

export function AdminReviewsQueue({ items }: AdminReviewsQueueProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
        No reviews yet.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-2xl border border-border/70 bg-muted/20 p-4"
        >
          <div className="mb-2 flex flex-wrap gap-2 text-xs">
            {item.isFlagged ? (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-800 dark:text-amber-200">
                Flagged
              </span>
            ) : null}
            {!item.isPublic ? (
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                Hidden
              </span>
            ) : null}
            {item.removedAt ? (
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-medium text-red-700 dark:text-red-300">
                Removed
              </span>
            ) : null}
            <span className="text-muted-foreground">
              Match {item.matchId.slice(0, 8)}…
            </span>
          </div>
          <ReviewCard review={toDisplay(item)} />
          <ModerationBar item={item} />
        </li>
      ))}
    </ul>
  );
}
