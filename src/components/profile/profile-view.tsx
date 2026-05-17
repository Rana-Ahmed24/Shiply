import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileReviews } from "@/components/profile/profile-reviews";
import { ProfileStats } from "@/components/profile/profile-stats";
import { Separator } from "@/components/ui/separator";
import type { PublicProfile } from "@/types/profile";

type ProfileViewProps = {
  profile: PublicProfile;
};

export function ProfileView({ profile }: ProfileViewProps) {
  return (
    <div className="space-y-8">
      <ProfileHeader profile={profile} />
      <ProfileStats profile={profile} />
      <Separator />
      <section>
        <h2 className="mb-4 text-lg font-semibold">Reviews</h2>
        <ProfileReviews reviews={profile.reviews} />
      </section>
    </div>
  );
}
