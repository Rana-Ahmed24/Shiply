import Link from "next/link";

import { Container } from "@/components/layout/container";
import { AvatarUploadForm } from "@/components/profile/avatar-upload-form";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { buttonVariants } from "@/components/ui/button";
import { VerificationStatusBanner } from "@/components/verification/verification-status-banner";
import { hasRole } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/server";
import { getPublicProfile } from "@/lib/profile/queries";
import { getTravelerVerification } from "@/lib/verification/queries";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
  const { user } = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/settings")}`
  );

  const profile = await getPublicProfile(user.id, user.id);
  const travelerVerification = hasRole(profile?.roles, "traveler")
    ? await getTravelerVerification(user.id)
    : null;

  if (!profile) {
    return (
      <Container className="py-12">
        <p className="text-muted-foreground">
          Could not load your profile. Please try again later.
        </p>
      </Container>
    );
  }

  return (
    <Container className="space-y-8 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-display text-3xl">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your Shiply profile
          </p>
        </div>
        <Link
          href={`/profile/${user.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
        >
          View public profile
        </Link>
      </div>

      {travelerVerification ? (
        <VerificationStatusBanner verification={travelerVerification} />
      ) : null}

      <AvatarUploadForm
        name={profile.full_name}
        avatarUrl={profile.avatar_url}
      />
      <ProfileEditForm profile={profile} />
    </Container>
  );
}
