import Link from "next/link";
import { MapPin, Languages } from "lucide-react";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { ProfileTierBadge } from "@/components/profile/profile-tier-badge";
import { ProfileVerificationBadges } from "@/components/profile/profile-verification-badges";
import { TravelerVerificationBadge } from "@/components/verification/traveler-verification-badge";
import { VerificationStatusBanner } from "@/components/verification/verification-status-banner";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hasRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import type { PublicProfile } from "@/types/profile";

type ProfileHeaderProps = {
  profile: PublicProfile;
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const isTraveler = hasRole(profile.roles, "traveler");

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <ProfileAvatar
          name={profile.full_name}
          avatarUrl={profile.avatar_url}
          size="lg"
        />
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-display text-2xl md:text-3xl">
                {profile.full_name ?? "HitchHiker member"}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.roles.map((role) => (
                  <Badge
                    key={role}
                    variant="secondary"
                    className="rounded-full capitalize"
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            {profile.is_owner && (
              <Link
                href="/settings"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-2xl"
                )}
              >
                Edit profile
              </Link>
            )}
          </div>

          {isTraveler && (
            <ProfileTierBadge tier={profile.traveler_tier} showDescription />
          )}

          {profile.bio && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          )}

          {profile.languages.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Languages className="mt-0.5 size-4 shrink-0 text-brand-teal" />
              <span>{profile.languages.join(" · ")}</span>
            </div>
          )}

          {profile.meetup_locations.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-teal" />
              <span>{profile.meetup_locations.join(" · ")}</span>
            </div>
          )}

          {isTraveler && profile.travelerVerification ? (
            profile.is_owner ? (
              <VerificationStatusBanner
                verification={profile.travelerVerification}
              />
            ) : profile.travelerVerification.status === "verified" ? (
              <TravelerVerificationBadge status="verified" />
            ) : null
          ) : null}

          <ProfileVerificationBadges verifications={profile.verifications} />
        </div>
      </div>
    </div>
  );
}
