import { Package } from "lucide-react";

import { RatingSummary } from "@/components/reviews/rating-summary";
import { tierProgress } from "@/lib/profile/tier";
import type { PublicProfile } from "@/types/profile";
import { getDisplayStats } from "@/lib/profile/queries";
import { hasRole } from "@/lib/auth/roles";

type ProfileStatsProps = {
  profile: PublicProfile;
};

export function ProfileStats({ profile }: ProfileStatsProps) {
  const stats = getDisplayStats(profile);
  const isTraveler = hasRole(profile.roles, "traveler");
  const isCustomer = hasRole(profile.roles, "customer");
  const progress = isTraveler ? tierProgress(profile.deals_completed) : null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {isTraveler && isCustomer
            ? "Ratings"
            : isTraveler
              ? "Traveler rating"
              : "Customer rating"}
        </p>
        <div className="mt-2 space-y-3">
          {isTraveler ? (
            <RatingSummary
              stats={{
                averageRating: profile.traveler_rating_avg,
                totalReviews: profile.traveler_review_count,
              }}
              label="As traveler"
            />
          ) : null}
          {isCustomer ? (
            <RatingSummary
              stats={{
                averageRating: profile.customer_rating_avg,
                totalReviews: profile.customer_review_count,
              }}
              label="As customer"
            />
          ) : null}
          {!isTraveler && !isCustomer && stats.rating == null ? (
            <p className="text-sm text-muted-foreground">No reviews yet</p>
          ) : null}
        </div>
      </div>
      <StatCard
        icon={Package}
        label={stats.dealsLabel}
        value={String(stats.dealsValue)}
      />
      {progress && (
        <StatCard
          icon={Package}
          label="Traveler level"
          value={progress.label}
        />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <Icon className="mb-2 size-5 text-brand-teal" aria-hidden />
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
