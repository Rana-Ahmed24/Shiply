import { MatchRoleBadge } from "@/components/matching/match-role-badge";
import type { HomeMatchItem } from "@/types/home-match";

type AcceptedMatchDetailsProps = {
  match: HomeMatchItem;
  compact?: boolean;
};

export function AcceptedMatchDetails({
  match,
  compact = false,
}: AcceptedMatchDetailsProps) {
  const isCustomer = match.isViewerCustomer;
  const otherPartyLabel = isCustomer ? "Traveler" : "Customer";
  const otherPartyName = isCustomer
    ? match.travelerName ?? "Traveler"
    : match.customerName ?? "Customer";

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <MatchRoleBadge role={isCustomer ? "customer" : "traveler"} />

      <p
        className={
          compact
            ? "text-sm text-muted-foreground"
            : "text-base font-medium text-foreground"
        }
      >
        {isCustomer ? (
          <>Your request was accepted</>
        ) : (
          <>You accepted this request</>
        )}
      </p>

      <p className="text-sm">
        <span className="text-muted-foreground">{otherPartyLabel}: </span>
        <span className="font-semibold text-foreground">{otherPartyName}</span>
      </p>

      {!compact && (
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Package</dt>
            <dd className="font-medium">{match.requestTitle}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Route</dt>
            <dd>{match.listingRoute}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Reward</dt>
            <dd className="font-semibold text-brand-gold">{match.agreedPriceLabel}</dd>
          </div>
        </dl>
      )}

      {compact && (
        <>
          <p className="text-sm text-muted-foreground">{match.listingRoute}</p>
          <p className="text-sm font-semibold text-brand-gold">
            {match.agreedPriceLabel}
          </p>
        </>
      )}
    </div>
  );
}
