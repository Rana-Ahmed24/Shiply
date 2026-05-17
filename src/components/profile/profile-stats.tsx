import { Package, Star } from "lucide-react";

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
  const progress = isTraveler ? tierProgress(profile.deals_completed) : null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        icon={Star}
        label="Rating"
        value={
          stats.rating != null
            ? `${stats.rating.toFixed(1)} (${stats.reviewCount})`
            : "No reviews yet"
        }
      />
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
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-soft">
      <Icon className="mb-2 size-5 text-brand-teal" aria-hidden />
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
