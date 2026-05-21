"use client";

import { useActionState, useCallback, useEffect, useState } from "react";

import { CompatibilityPanel } from "@/components/matching/compatibility-panel";
import { createMatchAction } from "@/lib/matching/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useActionStateToast } from "@/hooks/use-action-state-toast";
import type { CompatibilityResult } from "@/types/match";

type ListingOption = {
  id: string;
  route: string;
};

type TravelerAcceptPanelProps = {
  requestId: string;
  listings: ListingOption[];
};

export function TravelerAcceptPanel({
  requestId,
  listings,
}: TravelerAcceptPanelProps) {
  const [listingId, setListingId] = useState(listings[0]?.id ?? "");
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(
    null
  );
  const [loadingCompat, setLoadingCompat] = useState(false);
  const [state, formAction, pending] = useActionState(createMatchAction, {});

  useActionStateToast(state);

  const loadCompatibility = useCallback(async (lid: string) => {
    if (!lid) {
      setCompatibility(null);
      return;
    }
    setLoadingCompat(true);
    try {
      const res = await fetch(
        `/api/matches/compatibility?listingId=${lid}&requestId=${requestId}`
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
  }, [requestId]);

  useEffect(() => {
    void loadCompatibility(listingId);
  }, [listingId, loadCompatibility]);

  if (listings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Create an active trip listing to offer delivery for this request.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="role" value="traveler" />

        <div className="space-y-2">
          <Label htmlFor="match-listing">Your trip</Label>
          <select
            id="match-listing"
            name="listingId"
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm"
          >
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.route}
              </option>
            ))}
          </select>
        </div>

        <CompatibilityPanel result={compatibility} loading={loadingCompat} />

        <Button
          type="submit"
          disabled={
            pending || !listingId
          }
          className="w-full rounded-2xl bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
        >
          {pending ? "Offering…" : "Offer to deliver"}
        </Button>
      </form>
    </div>
  );
}
