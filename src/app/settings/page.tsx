import Link from "next/link";

import { Container } from "@/components/layout/container";
import { AvatarUploadForm } from "@/components/profile/avatar-upload-form";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { buttonVariants } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/server";
import { getPublicProfile } from "@/lib/profile/queries";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
  const { user } = await requireSession(
    `/login?redirectTo=${encodeURIComponent("/settings")}`
  );

  const profile = await getPublicProfile(user.id, user.id);

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
            Manage your HitchHiker profile
          </p>
        </div>
        <Link
          href={`/profile/${user.id}`}
          className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
        >
          View public profile
        </Link>
      </div>

      <AvatarUploadForm
        name={profile.full_name}
        avatarUrl={profile.avatar_url}
      />
      <ProfileEditForm profile={profile} />
    </Container>
  );
}
