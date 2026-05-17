import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { ProfileView } from "@/components/profile/profile-view";
import { getUser } from "@/lib/auth/server";
import { getPublicProfile } from "@/lib/profile/queries";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const viewer = await getUser();
  const profile = await getPublicProfile(id, viewer?.id);

  if (!profile) {
    notFound();
  }

  return (
    <Container className="py-10 md:py-14">
      <ProfileView profile={profile} />
    </Container>
  );
}
