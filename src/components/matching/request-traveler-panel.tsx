"use client";

import { useActionState, useCallback, useEffect, useState } from "react";

import { CompatibilityPanel } from "@/components/matching/compatibility-panel";
import { createMatchAction } from "@/lib/matching/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useActionStateToast } from "@/hooks/use-action-state-toast";
import type { CompatibilityResult } from "@/types/match";

type RequestOption = {
  id: string;
  title: string;
  category: string;
};

type RequestTravelerPanelProps = {
  listingId: string;
  requests: RequestOption[];
};

export function RequestTravelerPanel({
  listingId,
  requests,
}: RequestTravelerPanelProps) {
  const [requestId, setRequestId] = useState(requests[0]?.id ?? "");
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(
    null
  );
  const [loadingCompat, setLoadingCompat] = useState(false);
  const [state, formAction, pending] = useActionState(createMatchAction, {});

  useActionStateToast(state);

  const loadCompatibility = useCallback(async (rid: string) => {
    if (!rid) {
      setCompatibility(null);
      return;
    }
    setLoadingCompat(true);
    try {
      const res = await fetch(
        `/api/matches/compatibility?listingId=${listingId}&requestId=${rid}`
      );
      if (res.ok) {
        const json = (await res.json()) as { compatibility: CompatibilityResult };
        setCompatibility(json.compatibility);
      } else {
        setCompatibility(null);
      }
    } catch {
      setCompatibility(null);
    } finally {
      setLoadingCompat(false);
    }
  }, [listingId]);

  useEffect(() => {
    void loadCompatibility(requestId);
  }, [requestId, loadCompatibility]);

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Post an open request first, then you can ask this traveler to deliver it.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="role" value="customer" />

        <div className="space-y-2">
          <Label htmlFor="match-request">Your request</Label>
          <select
            id="match-request"
            name="requestId"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
          >
            {requests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.category})
              </option>
            ))}
          </select>
        </div>

        <CompatibilityPanel result={compatibility} loading={loadingCompat} />

        <Button
          type="submit"
          disabled={
            pending || !requestId || (compatibility != null && !compatibility.canMatch)
          }
          className="w-full rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
        >
          {pending ? "Sending…" : "Request this traveler"}
        </Button>
      </form>
    </div>
  );
}
